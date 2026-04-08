import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InsightsView } from "./InsightsView";

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
