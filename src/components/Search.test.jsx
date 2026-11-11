import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Search } from "./Search";
import { addSearchHistory } from "../lib/booksStorage";

vi.mock("../lib/booksStorage", () => ({
  getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}),
  clearSearchHistory: vi.fn(async () => {}),
}));

describe("Search", () => {
  it("reserves a separate mobile row for modes and keeps search controls shrinkable and touch-sized", async () => {
    render(<Search searchText="" setSearchText={vi.fn()} onSearchModeChange={vi.fn()} />);
    const input = await screen.findByRole("textbox", { name: "Search book titles" });
    expect(input).toHaveClass("min-w-0");
    expect(screen.getByRole("radiogroup", { name: "Search mode" })).toHaveClass("col-span-3", "row-start-2", "sm:col-span-1");
    for (const mode of screen.getAllByRole("radio")) expect(mode).toHaveClass("min-h-11");
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
