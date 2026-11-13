import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InsightsView } from "./InsightsView";
import { BOOK_NODE_INCREMENT, MAX_BOOK_NODES } from "../../lib/insightsModel";

const books = [
  {
    data: {
      doc_md5: "b1",
      doc_file_name_title: "Deep Work",
      doc_authors: "Cal Newport",
    },
    citations: [
      {
        note_body: "Deep work is the ability to focus",
        note_extra: "",
        note_page: 12,
      },
    ],
  },
];

describe("InsightsView", () => {
  it.each(["resolve", "reject"])("admits a deferred %s after StrictMode effect replay", async (outcome) => {
    let resolve, reject;
    const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
    const loadGraph = vi.fn(() => pending);
    render(
      <React.StrictMode>
        <MemoryRouter><InsightsView books={books} query="deep" loadGraph={loadGraph} /></MemoryRouter>
      </React.StrictMode>
    );
    expect(screen.getByText("Loading graph...")).toBeInTheDocument();
    if (outcome === "resolve") {
      resolve({ default: () => <div>Deferred graph ready</div> });
      expect(await screen.findByText("Deferred graph ready")).toBeInTheDocument();
    } else {
      reject(new Error("deferred offline"));
      expect(await screen.findByText("Graph is unavailable in this session. List and side panel remain fully functional.")).toBeInTheDocument();
    }
    expect(screen.queryByText("Loading graph...")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select Deep Work with 1 matches" }));
    expect(screen.getByRole("link", { name: "Open book Deep Work" })).toBeInTheDocument();
  });

  it("finishes loading the graph under the app's StrictMode wrapper", async () => {
    const loadGraph = vi.fn(async () => ({ default: () => <div>Graph ready</div> }));
    render(
      <React.StrictMode>
        <MemoryRouter><InsightsView books={books} query="deep" loadGraph={loadGraph} /></MemoryRouter>
      </React.StrictMode>
    );
    expect(await screen.findByText("Graph ready")).toBeInTheDocument();
    expect(screen.queryByText("Loading graph...")).not.toBeInTheDocument();
    expect(loadGraph).toHaveBeenCalled();
  });

  it("leaves loading for the list fallback when a StrictMode import fails", async () => {
    const loadGraph = vi.fn(async () => { throw new Error("offline"); });
    render(
      <React.StrictMode>
        <MemoryRouter><InsightsView books={books} query="deep" loadGraph={loadGraph} /></MemoryRouter>
      </React.StrictMode>
    );
    expect(await screen.findByText("Graph is unavailable in this session. List and side panel remain fully functional.")).toBeInTheDocument();
    expect(screen.queryByText("Loading graph...")).not.toBeInTheDocument();
  });

  it("reveals overflow after graph rejection and handles an empty replacement", async () => {
    const many = Array.from({ length: MAX_BOOK_NODES + 1 }, (_, i) => ({ ...books[0], data: { ...books[0].data, doc_md5: `overflow${i}` } }));
    const loadGraph = vi.fn(() => Promise.reject(new Error("offline")));
    const { rerender } = render(<MemoryRouter><InsightsView books={many} query="deep" loadGraph={loadGraph} /></MemoryRouter>);
    await screen.findByText("Graph is unavailable in this session. List and side panel remain fully functional.");
    fireEvent.click(screen.getByRole("button", { name: "Show 1 more (1 remaining)" }));
    expect(screen.getAllByRole("button", { name: /^Select Deep Work/ })).toHaveLength(MAX_BOOK_NODES + 1);
    rerender(<MemoryRouter><InsightsView books={[]} query="deep" loadGraph={loadGraph} /></MemoryRouter>);
    expect(screen.getByText("No matches found")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /more.*remaining/ })).not.toBeInTheDocument();
  });

  it("reveals all capped results progressively without losing selection", async () => {
    const total = MAX_BOOK_NODES + BOOK_NODE_INCREMENT + 1;
    const manyBooks = Array.from({ length: total }, (_, index) => ({
      ...books[0],
      data: { ...books[0].data, doc_md5: `b${index}`, doc_file_name_title: `Book ${String(index).padStart(3, "0")}` },
    }));
    const loadGraph = vi.fn(async () => ({ default: () => null }));
    render(<MemoryRouter><InsightsView books={manyBooks} query="deep" loadGraph={loadGraph} /></MemoryRouter>);

    expect(screen.getAllByRole("button", { name: /^Select Book/ })).toHaveLength(MAX_BOOK_NODES);
    expect(screen.getByText(`${MAX_BOOK_NODES} of ${total} results`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Select Book 001/ }));
    fireEvent.click(screen.getByRole("button", { name: `Show 40 more (41 remaining)` }));
    expect(screen.getAllByRole("button", { name: /^Select Book/ })).toHaveLength(MAX_BOOK_NODES + BOOK_NODE_INCREMENT);
    expect(screen.getByRole("button", { name: /Select Book 001/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Show 1 more (1 remaining)" }));
    expect(screen.getAllByRole("button", { name: /^Select Book/ })).toHaveLength(total);
    expect(screen.getByText(`${total} results`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Show .*more/ })).not.toBeInTheDocument();
    await waitFor(() => expect(loadGraph).toHaveBeenCalled());
  });

  it("keeps list flow available when graph lazy import fails", async () => {
    const failingLoadGraph = vi.fn(() => Promise.reject(new Error("graph fail")));

    render(
      <MemoryRouter>
        <InsightsView
          books={books}
          query="deep"
          loadGraph={failingLoadGraph}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Graph is unavailable in this session. List and side panel remain fully functional.")
      ).toBeInTheDocument();
    });

    const select = screen.getByRole("button", {
      name: "Select Deep Work with 1 matches",
    });
    fireEvent.click(select);

    expect(screen.getByRole("link", { name: "Open book Deep Work" })).toBeInTheDocument();
    expect(failingLoadGraph).toHaveBeenCalled();
  });
});
