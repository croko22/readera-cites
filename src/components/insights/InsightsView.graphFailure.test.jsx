import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InsightsView } from "./InsightsView";
import { MAX_BOOK_NODES } from "../../lib/insightsModel";

const UNAVAILABLE =
  "Graph is unavailable in this session. List and side panel remain fully functional.";

const books = [
  {
    data: { doc_md5: "b1", doc_file_name_title: "Deep Work", doc_authors: "Cal Newport" },
    citations: [{ note_body: "Deep work is the ability to focus", note_extra: "", note_page: 12 }],
  },
];

const manyBooks = Array.from({ length: MAX_BOOK_NODES + 41 }, (_, i) => ({
  ...books[0],
  data: { ...books[0].data, doc_md5: `m${i}`, doc_file_name_title: `Book ${String(i).padStart(3, "0")}` },
}));

const graphText = (label) => ({ default: () => <div>{label}</div> });

describe("InsightsView graph failure lifecycle (regression)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("S3: a synchronous loader throw shows the unavailable state instead of crashing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MemoryRouter>
        <InsightsView books={books} query="deep" loadGraph={() => { throw new Error("sync boom"); }} />
      </MemoryRouter>
    );
    expect(await screen.findByText(UNAVAILABLE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Deep Work with 1 matches" })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("S1: after a failure a query change does not re-import; only Retry Graph does", async () => {
    const loadGraph = vi.fn(() => Promise.reject(new Error("offline")));
    const { rerender } = render(
      <MemoryRouter>
        <InsightsView books={books} query="deep" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(await screen.findByText(UNAVAILABLE)).toBeInTheDocument();
    expect(loadGraph).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <InsightsView books={books} query="focus" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(await screen.findByText("Query: focus")).toBeInTheDocument();
    expect(loadGraph).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry Graph" }));
    await waitFor(() => expect(loadGraph).toHaveBeenCalledTimes(2));
  });

  it("S1: ready graph survives a query change and a reveal-more without re-import", async () => {
    const loadGraph = vi.fn(async () => graphText("Graph canvas"));
    const { rerender } = render(
      <MemoryRouter>
        <InsightsView books={manyBooks} query="deep" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(await screen.findByText("Graph canvas")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <InsightsView books={manyBooks} query="focus" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(await screen.findByText("Query: focus")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show 40 more (41 remaining)" }));
    expect(screen.getAllByRole("button", { name: /^Select Book/ })).toHaveLength(
      MAX_BOOK_NODES + 40
    );
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });

  it("S4: a renderer crash marks the graph unavailable and Retry reloads it", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let crash = true;
    const loadGraph = vi.fn(async () => ({
      default: () => {
        if (crash) throw new Error("renderer crashed");
        return <div>Graph recovered</div>;
      },
    }));
    render(
      <MemoryRouter>
        <InsightsView books={books} query="deep" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(await screen.findByText(UNAVAILABLE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry Graph" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Deep Work with 1 matches" })).toBeInTheDocument();

    crash = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry Graph" }));
    expect(await screen.findByText("Graph recovered")).toBeInTheDocument();
    expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    expect(loadGraph).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it("S3/S5: the default 10s timeout leaves the list and side panel working", async () => {
    vi.useFakeTimers();
    const loadGraph = vi.fn(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <InsightsView books={books} query="deep" loadGraph={loadGraph} />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading graph...")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9999);
    });
    expect(screen.getByText("Loading graph...")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.queryByText("Loading graph...")).not.toBeInTheDocument();
    expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select Deep Work with 1 matches" }));
    expect(screen.getByRole("link", { name: "Open book Deep Work" })).toBeInTheDocument();
    expect(screen.getByText("Deep work is the ability to focus")).toBeInTheDocument();
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });
});
