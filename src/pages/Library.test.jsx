import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Library } from "./Library";
import { getBooks } from "../lib/booksStorage";
import { downloadFile } from "../lib/exportUtils";

vi.mock("../lib/booksStorage", () => ({
  getBooks: vi.fn(), getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}), clearSearchHistory: vi.fn(async () => {}),
}));
vi.mock("../lib/exportUtils", async (importOriginal) => ({ ...await importOriginal(), downloadFile: vi.fn() }));

const books = ["Deep Work", "Another Book"].map((title, index) => ({
  data: { doc_md5: `b${index}`, doc_file_name_title: title, doc_favorites_time: 0 },
  citations: [{ note_body: "A quote" }],
}));

it("surfaces continue reading and this week's highlight activity", async () => {
  const now = Date.now();
  getBooks.mockResolvedValue([
    {
      data: {
        doc_md5: "b1",
        doc_file_name_title: "Deep Work",
        doc_authors: "Cal Newport",
        doc_favorites_time: 0,
        doc_last_read_time: now,
      },
      citations: [{ note_body: "A quote", note_timestamp: now }],
    },
    {
      data: {
        doc_md5: "b2",
        doc_file_name_title: "Older Book",
        doc_authors: "Someone",
        doc_favorites_time: 0,
        doc_last_read_time: now - 1000,
      },
      citations: [{ note_body: "Old quote", note_timestamp: now - 8 * 24 * 60 * 60 * 1000 }],
    },
  ]);

  render(<MemoryRouter><Library /></MemoryRouter>);

  expect(await screen.findByText("Continue reading")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Continue reading Deep Work" })).toHaveAttribute(
    "href",
    "/book/b1"
  );
  expect(screen.getByText("1 highlight this week")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Recent highlights" })).toHaveAttribute(
    "href",
    "/timeline"
  );
});

it("names complete-library export and retains all books despite an active title search", async () => {
  getBooks.mockResolvedValue(books);
  render(<MemoryRouter><Library /></MemoryRouter>);
  const search = await screen.findByRole("textbox", { name: "Search book titles" });
  fireEvent.change(search, { target: { value: "Deep" } });
  expect(screen.queryByRole("link", { name: "Another Book" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Download complete library JSON" }));
  const [json, filename, mime] = downloadFile.mock.calls.at(-1);
  const exported = JSON.parse(json);
  expect(exported.totalBooks).toBe(2);
  expect(exported.books.map((entry) => entry.title)).toEqual(["Deep Work", "Another Book"]);
  expect(filename).toBe("readera-library.json");
  expect(mime).toBe("application/json");
});
