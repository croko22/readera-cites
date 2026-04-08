import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Search } from "./Search";

vi.mock("../lib/booksStorage", () => ({
  getSearchHistory: vi.fn(async () => []),
  addSearchHistory: vi.fn(async () => {}),
  clearSearchHistory: vi.fn(async () => {}),
}));

describe("Search", () => {
  it("shows and changes insights mode", async () => {
    const onSearchModeChange = vi.fn();

    render(
      <Search
        searchText=""
        setSearchText={vi.fn()}
        searchMode="title"
        onSearchModeChange={onSearchModeChange}
      />
    );

    const insightsButton = await screen.findByRole("radio", {
      name: "Visualize query-to-book match graph",
    });

    fireEvent.click(insightsButton);
    expect(onSearchModeChange).toHaveBeenCalledWith("insights");
  });
});
