import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CitesList } from "./CitesList";

vi.mock("./Cite", () => ({
  Cite: ({ cite }) => <li>{cite.note_body}</li>,
}));

const citations = Array.from({ length: 95 }, (_, index) => ({ note_body: `Quote ${index + 1}` }));

afterEach(() => vi.unstubAllGlobals());

describe("CitesList", () => {
  it("preserves ordinary pagination and resets when filtered results shrink", () => {
    const { rerender } = render(<CitesList cites={citations} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    fireEvent.click(screen.getAllByRole("button", { name: "5" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "9" })[0]);
    expect(screen.getByText("Quote 81")).toBeInTheDocument();
    rerender(<CitesList cites={citations.slice(0, 3)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Quote 1")).toBeInTheDocument();
  });

  it("starts at the first page for a different result set even with the same length", () => {
    const { rerender } = render(<CitesList cites={citations.slice(0, 25)} />);
    fireEvent.click(screen.getAllByRole("button", { name: "2" })[0]);
    rerender(<CitesList cites={citations.slice(25, 50)} />);
    expect(screen.getByText("Quote 26")).toBeInTheDocument();
    expect(screen.queryByText("Quote 36")).not.toBeInTheDocument();
  });

  it("keeps navigation stable on unrelated rerenders and handles empty results", () => {
    const { rerender } = render(<CitesList cites={citations} />);
    fireEvent.click(screen.getAllByRole("button", { name: "2" })[0]);
    rerender(<CitesList cites={citations} />);
    expect(screen.getByText("Quote 11")).toBeInTheDocument();
    rerender(<CitesList cites={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("preserves grid capacity and resets reordered results", () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    const { rerender } = render(<CitesList cites={citations} view="grid" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(20);
    fireEvent.click(screen.getAllByRole("button", { name: "2" })[0]);
    expect(screen.getByText("Quote 21")).toBeInTheDocument();
    rerender(<CitesList cites={citations} view="grid" />);
    expect(screen.getByText("Quote 21")).toBeInTheDocument();
    rerender(<CitesList cites={[...citations].reverse()} view="grid" />);
    expect(screen.getByText("Quote 95")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(20);
  });
});
