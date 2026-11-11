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
