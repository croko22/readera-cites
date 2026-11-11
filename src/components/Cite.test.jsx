import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Cite } from "./Cite";

vi.mock("toastify-js", () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }));

const cite = { note_body: "LongQuote".repeat(40), note_extra: "LongNote".repeat(40), note_page: 12, note_mark: 1 };

describe("Cite responsive actions", () => {
  it.each(["list", "grid"])("keeps full content and copy/share behavior with touch-sized %s actions", async (variant) => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(async () => {}) } });
    render(<ul><Cite cite={cite} variant={variant} /></ul>);
    const copy = screen.getByRole("button", { name: "Copy citation" });
    const share = screen.getByRole("link", { name: "Share citation on X" });
    for (const control of [copy, share]) expect(control).toHaveClass("h-11", "w-11");
    expect(screen.getByRole("listitem")).toHaveClass("min-w-0", "[overflow-wrap:anywhere]");
    expect(screen.getByText(cite.note_body)).toBeInTheDocument();
    expect(screen.getByText(cite.note_extra)).toHaveClass("max-w-full");
    fireEvent.click(copy);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${cite.note_body}\nNote: ${cite.note_extra}\n(Page: 12)`));
    expect(share).toHaveAttribute("href", `https://twitter.com/intent/tweet?text=${cite.note_body}`);
    expect(share).toHaveAttribute("rel", "noreferrer");
  });
});
