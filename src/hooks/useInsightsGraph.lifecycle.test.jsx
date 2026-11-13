import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInsightsGraph } from "./useInsightsGraph";

const Graph = () => null;
const mod = { default: Graph };

describe("useInsightsGraph lifecycle (regression)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("S1/S2: exposes {status, GraphComponent, retry, fail} and imports once", async () => {
    const loadGraph = vi.fn(async () => mod);
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));
    expect(Object.keys(result.current).sort()).toEqual(["GraphComponent", "fail", "retry", "status"]);
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.GraphComponent).toBe(Graph);
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });

  it("S1: a new loader identity after ready does not re-import", async () => {
    const loadGraph = vi.fn(async () => mod);
    const { result, rerender } = renderHook(
      ({ lg }) => useInsightsGraph({ enabled: true, loadGraph: lg }),
      { initialProps: { lg: loadGraph } }
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    rerender({ lg: vi.fn(async () => mod) });
    expect(loadGraph).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("ready");
  });

  it("S3: the default 10s timeout is cleared after settlement", async () => {
    vi.useFakeTimers();
    const loadGraph = vi.fn(async () => mod);
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe("ready");
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(result.current.status).toBe("ready");
    expect(result.current.GraphComponent).toBe(Graph);
  });

  it("S3: the default timeout fires at 10000ms, not before", async () => {
    vi.useFakeTimers();
    const loadGraph = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9999);
    });
    expect(result.current.status).toBe("loading");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.status).toBe("error");
  });

  it("S3: a stale import cannot resolve a later retry attempt", async () => {
    vi.useFakeTimers();
    let resolveFirst;
    const first = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    let resolveSecond;
    const second = new Promise((resolve) => {
      resolveSecond = resolve;
    });
    const loadGraph = vi
      .fn()
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() => second);
    const { result } = renderHook(() =>
      useInsightsGraph({ enabled: true, loadGraph, timeoutMs: 25 })
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });
    expect(result.current.status).toBe("error");

    act(() => result.current.retry());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(loadGraph).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("loading");

    await act(async () => {
      resolveFirst(mod);
      await Promise.resolve();
    });
    expect(result.current.status).toBe("loading");
    expect(result.current.GraphComponent).toBeNull();

    await act(async () => {
      resolveSecond(mod);
      await Promise.resolve();
    });
    expect(result.current.status).toBe("ready");
  });

  it("S3: a synchronous loader throw becomes error with one call", async () => {
    const loadGraph = vi.fn(() => {
      throw new Error("sync boom");
    });
    const { result } = renderHook(() => useInsightsGraph({ enabled: true, loadGraph }));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.GraphComponent).toBeNull();
    expect(loadGraph).toHaveBeenCalledTimes(1);
  });

  it("S3: a late resolution after unmount neither throws nor warns", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let resolveImport;
    const pending = new Promise((resolve) => {
      resolveImport = resolve;
    });
    const { result, unmount } = renderHook(() =>
      useInsightsGraph({ enabled: true, loadGraph: vi.fn(() => pending) })
    );
    expect(result.current.status).toBe("loading");
    unmount();
    await act(async () => {
      resolveImport(mod);
      await Promise.resolve();
    });
    expect(consoleError).not.toHaveBeenCalled();
  });
});
