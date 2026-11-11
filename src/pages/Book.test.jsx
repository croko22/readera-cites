import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Book } from "./Book";
import { getBooks } from "../lib/booksStorage";
import { buildBookJson, downloadFile, formatCitationsAsMarkdown, formatCitationsAsText } from "../lib/exportUtils";

vi.mock("toastify-js", () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }));
vi.mock("../lib/booksStorage", () => ({
  getBooks: vi.fn(), getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}), clearSearchHistory: vi.fn(async () => {}),
}));
vi.mock("../lib/exportUtils", async (importOriginal) => ({ ...await importOriginal(), downloadFile: vi.fn() }));

const book = {
  data: { doc_md5: "b1", doc_file_name_title: "Deep Work", doc_authors: "Cal Newport", doc_favorites_time: 0 },
  citations: [
    { note_body: "Red quote", note_mark: 1, note_page: 5 },
    { note_body: "Blue quote", note_mark: 4, note_page: 10 },
  ],
};
const mountBook = async () => {
  render(<MemoryRouter initialEntries={[{ pathname: "/book/b1", state: book }]}><Routes>
    <Route path="/book/:id" element={<Book />} />
  </Routes></MemoryRouter>);
  await screen.findByRole("heading", { name: "Deep Work" });
};
const openExport = () => fireEvent.keyDown(screen.getByRole("button", { name: "Export" }), { key: "Enter" });

beforeEach(() => {
  vi.clearAllMocks();
  getBooks.mockResolvedValue([book]);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(async () => {}) } });
});
afterEach(() => vi.restoreAllMocks());

describe("Book clarity", () => {
  it("labels book search and color filters, including their active state", async () => {
    await mountBook();
    expect(screen.getByRole("textbox", { name: "Search citations in this book" })).toBeInTheDocument();
    const all = screen.getByRole("button", { name: "All colors, 2 citations" });
    expect(all).toHaveAttribute("aria-pressed", "true");
    for (const name of ["Gray", "Red", "Yellow", "Green", "Blue"]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${name} citations,`) })).toHaveAttribute("aria-pressed", "false");
    }
    const red = screen.getByRole("button", { name: "Red citations, 1" });
    fireEvent.click(red);
    expect(red).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Red quote")).toBeInTheDocument();
    expect(screen.queryByText("Blue quote")).not.toBeInTheDocument();
    fireEvent.click(all);
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Blue quote")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sort citations by page, low to high" })).toHaveAttribute("aria-pressed", "true");
    const descending = screen.getByRole("button", { name: "Sort citations by page, high to low" });
    fireEvent.click(descending);
    expect(descending).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Blue quote");
  });

  it("describes the distinct scope of each export format", async () => {
    await mountBook();
    openExport();
    expect(await screen.findByRole("menuitem", { name: "Copy filtered citations" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Download filtered Markdown" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Download complete book JSON" })).toBeInTheDocument();
  });

  it("preserves filtered clipboard and Markdown payloads and complete JSON exports", async () => {
    await mountBook();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Red" } });
    openExport();
    fireEvent.click((await screen.findAllByRole("menuitem"))[0]);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(formatCitationsAsText(book, [book.citations[0]])));
    openExport();
    fireEvent.click((await screen.findAllByRole("menuitem"))[1]);
    expect(downloadFile).toHaveBeenLastCalledWith(formatCitationsAsMarkdown(book, [book.citations[0]]), "Deep_Work.md", "text/markdown;charset=utf-8");
    openExport();
    fireEvent.click((await screen.findAllByRole("menuitem"))[2]);
    expect(downloadFile).toHaveBeenLastCalledWith(JSON.stringify(buildBookJson(book), null, 2), "Deep_Work.json", "application/json;charset=utf-8");
  });
});
