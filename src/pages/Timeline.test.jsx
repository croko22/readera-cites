import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Timeline } from "./Timeline";
import { getBooks } from "../lib/booksStorage";

vi.mock("toastify-js", () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }));
vi.mock("../lib/booksStorage", () => ({
  getBooks: vi.fn(),
  getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}),
  clearSearchHistory: vi.fn(async () => {}),
}));

const DAY = 24 * 60 * 60 * 1000;

function makeBooks() {
  const now = Date.now();
  return [
    {
      data: {
        doc_md5: "b1",
        doc_file_name_title: "Deep Work",
        doc_authors: "Cal Newport",
        doc_last_read_time: now,
      },
      citations: [
        { note_body: "Today quote", note_timestamp: now, note_page: 12, note_mark: 1 },
        { note_body: "Older quote", note_timestamp: now - 8 * DAY, note_page: 5 },
      ],
    },
    {
      data: {
        doc_md5: "b2",
        doc_file_name_title: "Another Book",
        doc_authors: "Another Author",
        doc_last_read_time: 0,
      },
      citations: [{ note_page: 7, note_timestamp: null }],
    },
    {
      data: {
        doc_md5: "b3",
        doc_file_name_title: "Empty Book",
        doc_authors: "",
        doc_last_read_time: 0,
      },
      citations: [],
    },
  ];
}

const renderTimeline = () =>
  render(
    <MemoryRouter initialEntries={["/timeline"]}>
      <Routes>
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/book/:id" element={<h1>Book page</h1>} />
        <Route path="/upload" element={<h1>Upload page</h1>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.resetAllMocks();
  getBooks.mockResolvedValue(makeBooks());
});

describe("Timeline", () => {
  it("renders grouped highlights, source links, and page-only entries", async () => {
    renderTimeline();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Recent highlights" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Undated" })).toBeInTheDocument();
    expect(screen.getByText("Page bookmark")).toBeInTheDocument();

    const deepWorkLinks = screen.getAllByRole("link", {
      name: "Open Deep Work in book view",
    });
    expect(deepWorkLinks.length).toBeGreaterThan(0);
    expect(deepWorkLinks[0]).toHaveAttribute("href", "/book/b1");
  });

  it("filters to one book and explains an empty selected book", async () => {
    renderTimeline();
    await screen.findByRole("heading", { name: "Today" });

    const scope = screen.getByLabelText("Book scope");
    fireEvent.change(scope, { target: { value: "b2" } });
    expect(screen.queryByRole("heading", { name: "Today" })).not.toBeInTheDocument();
    expect(screen.getByText("Page bookmark")).toBeInTheDocument();

    fireEvent.change(scope, { target: { value: "b3" } });
    expect(await screen.findByText("No highlights in this book")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show all books" }));
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
  });

  it("changes grouping and reverses ordering while keeping Undated last", async () => {
    renderTimeline();
    await screen.findByRole("heading", { name: "Today" });

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByRole("heading", { name: "Today" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Undated" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    fireEvent.click(screen.getByRole("button", { name: "Newest first" }));
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings.at(-1)).toBe("Undated");
    expect(headings.at(-2)).toBe("Today");
  });

  it("shows a recovery empty state when there are no highlights", async () => {
    getBooks.mockResolvedValue([
      {
        data: { doc_md5: "empty", doc_file_name_title: "Empty Book" },
        citations: [],
      },
    ]);
    renderTimeline();

    expect(await screen.findByText("No highlights yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload backup" })).toBeInTheDocument();
  });
});
