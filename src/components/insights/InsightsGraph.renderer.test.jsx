import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { InsightsGraph } from "./InsightsGraph";

it("paints query and selected book labels with the installed renderer", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", undefined);
  vi.stubGlobal("requestAnimationFrame", (fn) => setTimeout(() => fn(Date.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  const fillText = vi.fn();
  const arc = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 640, height: 340 });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function () {
    return new Proxy({ canvas: this, fillText, arc }, {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "measureText") return () => ({ width: 30 });
        if (key === "getImageData") return () => ({ data: new Uint8ClampedArray(4) });
        return () => {};
      },
    });
  });
  try {
    render(<InsightsGraph model={{
      nodes: [
        { id: "query", type: "query", label: "focus", weight: 1 },
        { id: "b", type: "book", bookId: "b", label: "Book", weight: 1 },
      ],
      edges: [{ source: "query", target: "b", weight: 1 }],
    }} selectedBookId="b" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(arc).toHaveBeenCalled();
    expect(fillText).toHaveBeenCalledWith("focus", expect.any(Number), expect.any(Number));
    expect(fillText).toHaveBeenCalledWith("Book", expect.any(Number), expect.any(Number));
  } finally {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  }
});
