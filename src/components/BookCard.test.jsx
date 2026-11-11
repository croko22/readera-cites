import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Accordion } from "./ui/accordion";
import { BookCard } from "./BookCard";

const title = "UnbrokenTitle".repeat(30);
const author = "UnbrokenAuthor".repeat(25);
const book = { data: { doc_md5: "b1", doc_file_name_title: title, doc_authors: author, doc_favorites_time: 0 }, citations: [{ note_body: "A quote" }] };

it("keeps long-title navigation separate from a touch-sized details disclosure", () => {
  render(<MemoryRouter><Routes>
    <Route path="/" element={<Accordion type="single" collapsible><BookCard libro={book} bookKey={0} /></Accordion>} />
    <Route path="/book/b1" element={<h1>Book destination</h1>} />
  </Routes></MemoryRouter>);
  const link = screen.getByRole("link", { name: title });
  expect(link.closest("button")).toBeNull();
  expect(screen.getByText(title)).toHaveClass("[overflow-wrap:anywhere]");
  const details = screen.getByRole("button", { name: `Book details for ${title}` });
  expect(details).toHaveClass("h-11", "w-11");
  expect(details).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(details);
  expect(details).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText(author, { exact: false })).toBeInTheDocument();
  fireEvent.click(link);
  expect(screen.getByRole("heading", { name: "Book destination" })).toBeInTheDocument();
});
