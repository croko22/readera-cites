import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Cite } from "./Cite";

const { showToast, toastOptions } = vi.hoisted(() => ({
  showToast: vi.fn(),
  toastOptions: vi.fn(),
}));
vi.mock("toastify-js", () => ({
  default: vi.fn((options) => {
    toastOptions(options);
    return { showToast };
  }),
}));

const cite = { note_body: "LongQuote".repeat(40), note_extra: "LongNote".repeat(40), note_page: 12, note_mark: 1 };

describe("Cite responsive actions", () => {
  afterEach(() => {
    delete document.execCommand;
    vi.clearAllMocks();
  });

  it("shows optional source context and a fallback for page-only entries", () => {
    render(
      <ul>
        <Cite
          cite={{ note_page: 7 }}
          source={<a href="/book/b1">Deep Work</a>}
          emptyLabel="Page bookmark"
        />
      </ul>
    );

    expect(screen.getByRole("link", { name: "Deep Work" })).toHaveAttribute(
      "href",
      "/book/b1"
    );
    expect(screen.getByText("Page bookmark")).toBeInTheDocument();
  });

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

  it("reports fallback delivery when the clipboard API is denied", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {
          throw new Error("clipboard denied");
        }),
      },
    });
    document.execCommand = vi.fn(() => true);
    render(<ul><Cite cite={cite} /></ul>);

    fireEvent.click(screen.getByRole("button", { name: "Copy citation" }));

    await waitFor(() =>
      expect(toastOptions).toHaveBeenCalledWith(
        expect.objectContaining({ text: "Quote copied to clipboard (fallback)" })
      )
    );
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("reports failure when both delivery paths fail", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {
          throw new Error("clipboard denied");
        }),
      },
    });
    document.execCommand = vi.fn(() => {
      throw new Error("copy blocked");
    });
    render(<ul><Cite cite={cite} /></ul>);

    fireEvent.click(screen.getByRole("button", { name: "Copy citation" }));

    await waitFor(() =>
      expect(toastOptions).toHaveBeenCalledWith(
        expect.objectContaining({ text: "Failed to copy quote" })
      )
    );
    expect(document.querySelector("textarea")).toBeNull();
  });
});
