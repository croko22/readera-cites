import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInsightsGraph } from "./useInsightsGraph";

const Graph = () => null;

describe("useInsightsGraph", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("loads one graph component while enabled", async () => {
    const loadGraph = vi.fn(async () => ({ default: Graph }));
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.GraphComponent).toBe(Graph);
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });

  it("keeps a single import under StrictMode effect replay", async () => {
    const loadGraph = vi.fn(async () => ({ default: Graph }));
    const { result } = renderHook(
      () => useInsightsGraph({ enabled: true, loadGraph }),
      { wrapper: React.StrictMode }
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.GraphComponent).toBe(Graph);
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });

  it("does not load while disabled", () => {
    const loadGraph = vi.fn();
    const { result } = renderHook(() => useInsightsGraph({ enabled: false, loadGraph }));

    expect(result.current.status).toBe("idle");
    expect(loadGraph).not.toHaveBeenCalled();
  });

  it("reports an error when the import times out", async () => {
    vi.useFakeTimers();
    const loadGraph = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() =>
      useInsightsGraph({ enabled: true, loadGraph, timeoutMs: 25 })
    );

    expect(result.current.status).toBe("loading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });

    expect(result.current.status).toBe("error");
  });

  it("ignores a late import resolution after the timeout wins", async () => {
    vi.useFakeTimers();
    let resolveImport;
    const pending = new Promise((resolve) => {
      resolveImport = resolve;
    });
    const loadGraph = vi.fn(() => pending);
    const { result } = renderHook(() =>
      useInsightsGraph({ enabled: true, loadGraph, timeoutMs: 25 })
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      resolveImport({ default: Graph });
      await pending;
    });

    expect(result.current.status).toBe("error");
    expect(result.current.GraphComponent).toBeNull();
  });

  it("turns a synchronous loader throw into an error state", async () => {
    const loadGraph = vi.fn(() => {
      throw new Error("sync failure");
    });
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("exposes a failure transition for renderer errors", async () => {
    const loadGraph = vi.fn(async () => ({ default: Graph }));
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.fail());
    expect(result.current.status).toBe("error");
  });

  it("retries after failure and loads again", async () => {
    const loadGraph = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ default: Graph });
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));

    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.GraphComponent).toBe(Graph);
    expect(loadGraph).toHaveBeenCalledTimes(2);
  });

  it("clears the timeout after a successful import", async () => {
    const clearTimeout = vi.spyOn(globalThis, "clearTimeout");
    const loadGraph = vi.fn(async () => ({ default: Graph }));
    const { result } = renderHook(() =>
      useInsightsGraph({ enabled: true, loadGraph, timeoutMs: 5000 })
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(clearTimeout).toHaveBeenCalled();
  });
});
