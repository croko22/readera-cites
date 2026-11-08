import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Upload } from "./Upload";
import { extractBooks } from "../lib/readEraIntake";
import { getSettings, setBooks } from "../lib/booksStorage";

vi.mock("toastify-js", () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }));
vi.mock("../lib/booksStorage", () => ({ getSettings: vi.fn(), setBooks: vi.fn() }));
vi.mock("../lib/readEraIntake", async (importOriginal) => ({
  ...await importOriginal(),
  extractBooks: vi.fn(),
}));

const books = [{ data: { doc_md5: "b1", doc_file_name_title: "Deep Work" }, citations: [{ note_body: "Focus" }] }];
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const selectFile = (name = "library.json") => fireEvent.change(screen.getByLabelText("Upload library file"), {
  target: { files: [new File(["backup"], name)] },
});
const mountUpload = async () => {
  const view = render(<MemoryRouter initialEntries={["/upload"]}><Routes>
    <Route path="/upload" element={<Upload />} />
    <Route path="/" element={<h1>Library destination</h1>} />
  </Routes></MemoryRouter>);
  await waitFor(() => expect(screen.getByLabelText("Minimum citations per book:")).toHaveValue(0));
  return view;
};

beforeEach(() => {
  vi.resetAllMocks();
  getSettings.mockResolvedValue({ defaultFilter: 0 });
  extractBooks.mockResolvedValue({ books, warnings: [] });
  setBooks.mockResolvedValue(undefined);
});
afterEach(() => vi.useRealTimers());

describe("Upload hardening", () => {
  it("serializes replacement reads and pending saves across modal and drops", async () => {
    await mountUpload();
    selectFile("first.json");
    fireEvent.click(await screen.findByRole("button", { name: "Preview" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    const reading = deferred();
    extractBooks.mockReturnValueOnce(reading.promise);
    selectFile("replacement.bak");
    fireEvent.click(screen.getByRole("button", { name: "Load Library" }));
    expect(setBooks).not.toHaveBeenCalled();
    await act(async () => reading.resolve({ books, warnings: [] }));
    const saving = deferred();
    setBooks.mockReturnValueOnce(saving.promise);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    fireEvent.click(screen.getByRole("button", { name: "Load Books" }));
    fireEvent.click(screen.getByRole("button", { name: "Load Books" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.drop(screen.getByRole("button", { name: "Upload a different library file" }), {
      dataTransfer: { files: [new File([""], "intruder.json")] },
    });
    expect(extractBooks).toHaveBeenCalledTimes(2);
    expect(setBooks).toHaveBeenCalledTimes(1);
    vi.useFakeTimers();
    await act(async () => saving.reject(new Error("quota")));
    expect(screen.getByRole("alert").textContent).toBe("Failed to save library. Your backup is still ready. Try loading it again.");
    await act(async () => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Library destination")).not.toBeInTheDocument();
    expect(screen.getByText("replacement.bak")).toBeInTheDocument();
  });

  it("keeps ordinary filtering and rejects zero matching books without saving", async () => {
    const second = { ...books[0], data: { ...books[0].data, doc_md5: "b2" }, citations: [...books[0].citations, ...books[0].citations] };
    extractBooks.mockResolvedValueOnce({ books: [...books, second], warnings: [] });
    await mountUpload();
    selectFile();
    const load = await screen.findByRole("button", { name: "Load Library" });
    fireEvent.change(screen.getByLabelText("Minimum citations per book:"), { target: { value: "3" } });
    fireEvent.click(load);
    expect(setBooks).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("No books match the citation criteria! Lower the minimum citations to include more books.");
    fireEvent.change(screen.getByLabelText("Minimum citations per book:"), { target: { value: "2" } });
    vi.useFakeTimers();
    fireEvent.click(load);
    await act(async () => {});
    expect(setBooks).toHaveBeenCalledExactlyOnceWith([second]);
    await act(async () => vi.advanceTimersByTime(500));
    expect(screen.getByText("Library destination")).toBeInTheDocument();
  });

  it("schedules no navigation when a pending save resolves after unmount", async () => {
    const saving = deferred();
    setBooks.mockReturnValueOnce(saving.promise);
    const view = await mountUpload();
    selectFile();
    const load = await screen.findByRole("button", { name: "Load Library" });
    vi.useFakeTimers();
    fireEvent.click(load);
    view.unmount();
    await act(async () => saving.resolve());
    expect(vi.getTimerCount()).toBe(0);
  });

  it("preserves ordinary successful filtered imports", async () => {
    const excluded = { ...books[0], citations: [] };
    extractBooks.mockResolvedValueOnce({ books: [...books, excluded], warnings: [] });
    await mountUpload();
    selectFile();
    const load = await screen.findByRole("button", { name: "Load Library" });
    fireEvent.change(screen.getByLabelText("Minimum citations per book:"), { target: { value: "1" } });
    vi.useFakeTimers();
    fireEvent.click(load);
    await act(async () => {});
    expect(setBooks).toHaveBeenCalledExactlyOnceWith(books);
    await act(async () => vi.advanceTimersByTime(500));
    expect(screen.getByText("Library destination")).toBeInTheDocument();
  });

  it("announces reading and ignores overlapping selections and drops", async () => {
    const reading = deferred();
    extractBooks.mockReturnValueOnce(reading.promise);
    await mountUpload();
    selectFile("first.json");
    expect(screen.getByRole("status")).toHaveTextContent("Reading backup...");
    const dropZone = screen.getByRole("button", { name: "Upload a ReadEra library file" });
    expect(dropZone).toBeDisabled();
    selectFile("second.bak");
    fireEvent.drop(dropZone, { dataTransfer: { files: [new File([""], "third.bak")] } });
    expect(extractBooks).toHaveBeenCalledTimes(1);
    expect(setBooks).not.toHaveBeenCalled();
    await act(async () => reading.resolve({ books, warnings: ["1 book skipped: missing title"] }));
    expect(screen.getByText("first.json")).toBeInTheDocument();
    expect(screen.getByText("1 book skipped: missing title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load Library" })).toBeEnabled();
  });

  it("retains import errors inline and allows retrying the same file", async () => {
    extractBooks.mockRejectedValueOnce(new Error("library.json not found inside .bak"));
    await mountUpload();
    selectFile("backup.bak");
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not find library data in this backup");
    expect(setBooks).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Upload library file")).toHaveValue("");
    selectFile("backup.bak");
    expect(await screen.findByText("File uploaded successfully!")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports unsupported files without parsing or persisting them", async () => {
    await mountUpload();
    selectFile("notes.txt");
    expect(screen.getByRole("alert")).toHaveTextContent("Please upload a .json or .bak file!");
    expect(extractBooks).not.toHaveBeenCalled();
    expect(setBooks).not.toHaveBeenCalled();
  });

  it("prevents repeated saves, retains the backup after failure, and allows retry", async () => {
    const saving = deferred();
    setBooks.mockReturnValueOnce(saving.promise);
    await mountUpload();
    selectFile();
    const load = await screen.findByRole("button", { name: "Load Library" });
    fireEvent.click(load);
    fireEvent.click(load);
    expect(screen.getByRole("status")).toHaveTextContent("Saving library...");
    expect(load).toBeDisabled();
    expect(screen.getByRole("button", { name: "Upload a different library file" })).toBeDisabled();
    expect(setBooks).toHaveBeenCalledTimes(1);
    expect(setBooks).toHaveBeenCalledWith(books);
    await act(async () => saving.reject(new Error("quota")));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to save library");
    expect(load).toBeEnabled();
    expect(screen.getByText("File uploaded successfully!")).toBeInTheDocument();
    fireEvent.click(load);
    expect(await screen.findByRole("heading", { name: "Library destination" })).toBeInTheDocument();
    expect(setBooks).toHaveBeenCalledTimes(2);
  });

  it("does not navigate after unmounting during the post-save delay", async () => {
    const view = await mountUpload();
    selectFile();
    const load = await screen.findByRole("button", { name: "Load Library" });
    vi.useFakeTimers();
    fireEvent.click(load);
    await act(async () => {});
    expect(screen.getByRole("status")).toHaveTextContent("Library saved");
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps save status and retryable errors visible inside the preview dialog", async () => {
    const saving = deferred();
    setBooks.mockReturnValueOnce(saving.promise);
    await mountUpload();
    selectFile();
    fireEvent.click(await screen.findByRole("button", { name: "Preview" }));
    const load = screen.getByRole("button", { name: "Load Books" });
    fireEvent.click(load);
    expect(load).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Saving library...");
    await act(async () => saving.reject(new Error("quota")));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to save library");
    expect(load).toBeEnabled();
    expect(setBooks).toHaveBeenCalledTimes(1);
  });
});
