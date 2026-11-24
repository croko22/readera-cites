import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Search } from "./Search";
import { addSearchHistory, getSearchHistory } from "../lib/booksStorage";

vi.mock("../lib/booksStorage", () => ({
  getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}),
  clearSearchHistory: vi.fn(async () => {}),
}));

beforeEach(() => {
  vi.clearAllMocks();
  getSearchHistory.mockResolvedValue([]);
});

describe("Search", () => {
  it("keeps the input shrinkable and gives modes and clear a separate row", async () => {
    render(<Search searchText="" setSearchText={vi.fn()} onSearchModeChange={vi.fn()} />);
    const input = await screen.findByRole("textbox", { name: "Search book titles" });
    expect(input).toHaveClass("min-w-0");
    const group = screen.getByRole("radiogroup", { name: "Search mode" });
    expect(group).toHaveClass("col-span-3", "row-start-2");
    expect(group).not.toHaveClass("sm:col-span-1");
    expect(group).toHaveClass("p-0.5");
    for (const mode of screen.getAllByRole("radio")) {
      expect(mode).toHaveClass("min-h-8", "pointer-coarse:after:-inset-y-1.5");
    }
  });

  it("shows Clear only when there is a query", async () => {
    const { rerender } = render(<Search searchText="" setSearchText={vi.fn()} />);
    await screen.findByRole("textbox");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    rerender(<Search searchText="focus" setSearchText={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveClass("h-11", "w-11");
  });

  it.each([
    ["title", "Search book titles"],
    ["citations", "Search all citations"],
    ["insights", "Explore citation matches across books"],
  ])("names the %s input and placeholder for its actual scope", async (searchMode, label) => {
    render(<Search searchText="" setSearchText={vi.fn()} searchMode={searchMode} />);
    const input = await screen.findByRole("textbox", { name: label });
    expect(input).toHaveAttribute("placeholder", `${label}...`);
  });

  it("allows the book page to describe its narrower citation scope", async () => {
    render(<Search searchText="" setSearchText={vi.fn()} searchMode="citations" label="Search citations in this book" />);
    expect(await screen.findByRole("textbox", { name: "Search citations in this book" })).toHaveAttribute("placeholder", "Search citations in this book...");
  });

  it("supports arrow-key selection and roving focus across search modes", async () => {
    const onSearchModeChange = vi.fn();
    render(<Search searchText="" setSearchText={vi.fn()} searchMode="title" onSearchModeChange={onSearchModeChange} />);
    const title = await screen.findByRole("radio", { name: "Titles: search book titles" });
    const citations = screen.getByRole("radio", { name: "Citations: search all citations" });
    const insights = screen.getByRole("radio", { name: "Insights: explore citation matches across books" });
    expect(title).toHaveAttribute("tabindex", "0");
    expect(citations).toHaveAttribute("tabindex", "-1");
    title.focus();
    fireEvent.keyDown(title, { key: "ArrowRight" });
    expect(onSearchModeChange).toHaveBeenLastCalledWith("citations");
    expect(citations).toHaveFocus();
    fireEvent.keyDown(citations, { key: "End" });
    expect(onSearchModeChange).toHaveBeenLastCalledWith("insights");
    expect(insights).toHaveFocus();
    fireEvent.keyDown(insights, { key: "ArrowRight" });
    expect(onSearchModeChange).toHaveBeenLastCalledWith("title");
    expect(title).toHaveFocus();
    fireEvent.keyDown(title, { key: "ArrowLeft" });
    expect(onSearchModeChange).toHaveBeenLastCalledWith("insights");
    expect(insights).toHaveFocus();
  });

  it("preserves text changes, history recording, and clear-and-refocus behavior", async () => {
    const setSearchText = vi.fn();
    render(<Search searchText="focus" setSearchText={setSearchText} />);
    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "reading" } });
    expect(setSearchText).toHaveBeenCalledWith("reading");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(addSearchHistory).toHaveBeenCalledWith("focus"));
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(setSearchText).toHaveBeenLastCalledWith("");
    expect(input).toHaveFocus();
  });

  it("dismisses recent searches with Escape without changing the query", async () => {
    getSearchHistory.mockResolvedValue(["focus", "reading"]);
    const setSearchText = vi.fn();
    render(<Search searchText="" setSearchText={setSearchText} />);
    const input = await screen.findByRole("textbox");
    input.focus();
    expect(await screen.findByText("Recent searches")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
    expect(setSearchText).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it("reopens recent searches when the focused field is clicked again", async () => {
    getSearchHistory.mockResolvedValue(["focus"]);
    render(<Search searchText="" setSearchText={vi.fn()} />);
    const input = await screen.findByRole("textbox");
    input.focus();
    expect(await screen.findByText("Recent searches")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
    expect(input).toHaveFocus();

    fireEvent.click(input);
    expect(await screen.findByText("Recent searches")).toBeInTheDocument();
  });

  it("closes recent searches when focus leaves the search area", async () => {
    getSearchHistory.mockResolvedValue(["focus"]);
    render(<Search searchText="" setSearchText={vi.fn()} />);
    const input = await screen.findByRole("textbox");
    input.focus();
    expect(await screen.findByText("Recent searches")).toBeInTheDocument();

    fireEvent.blur(input, { relatedTarget: document.body });

    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
  });

  it("focuses the field with / but never steals focus from another text field", async () => {
    render(<Search searchText="" setSearchText={vi.fn()} />);
    const input = await screen.findByRole("textbox");

    fireEvent.keyDown(document.body, { key: "/" });
    expect(input).toHaveFocus();

    input.blur();
    const otherField = document.createElement("input");
    document.body.appendChild(otherField);
    otherField.focus();
    fireEvent.keyDown(otherField, { key: "/" });
    expect(input).not.toHaveFocus();
    expect(otherField).toHaveFocus();
    otherField.remove();
  });

  it.each([
    ["title", "Titles: search book titles"],
    ["citations", "Citations: search all citations"],
    ["insights", "Insights: explore citation matches across books"],
  ])("preserves switching to %s mode", async (mode, name) => {
    const onSearchModeChange = vi.fn();

    render(
      <Search
        searchText=""
        setSearchText={vi.fn()}
        searchMode="title"
        onSearchModeChange={onSearchModeChange}
      />
    );

    const modeButton = await screen.findByRole("radio", {
      name,
    });

    fireEvent.click(modeButton);
    expect(onSearchModeChange).toHaveBeenCalledWith(mode);
  });
});
