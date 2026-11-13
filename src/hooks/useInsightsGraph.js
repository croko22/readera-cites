import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 10000;
const defaultLoadGraph = () => import("../components/insights/InsightsGraph");

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Graph import timed out")), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Owns optional graph availability: acquisition, timeout, failure, disposal,
 * and retry. Callers decide when a graph should be available and render the
 * returned component; the renderer remains a separate module.
 *
 * @param {object} options
 * @param {boolean} options.enabled - Whether the graph should be loaded.
 * @param {() => Promise<object>} [options.loadGraph] - Module loader.
 * @param {number} [options.timeoutMs] - Import timeout.
 * @returns {{ status: "idle"|"loading"|"ready"|"error", GraphComponent: Function|null, retry: () => void, fail: () => void }}
 */
export function useInsightsGraph({
  enabled,
  loadGraph = defaultLoadGraph,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const [status, setStatus] = useState("idle");
  const [GraphComponent, setGraphComponent] = useState(null);
  const activeRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    // StrictMode replays setup after cleanup without recreating these refs.
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || status !== "idle" || loadingRef.current) return;

    loadingRef.current = true;
    setStatus("loading");

    withTimeout(Promise.resolve().then(loadGraph), timeoutMs)
      .then((mod) => {
        if (!activeRef.current) return;
        setGraphComponent(() => mod.default || mod.InsightsGraph || null);
        setStatus("ready");
      })
      .catch(() => {
        if (!activeRef.current) return;
        setStatus("error");
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [enabled, status, loadGraph, timeoutMs]);

  const retry = useCallback(() => {
    setStatus("idle");
  }, []);

  const fail = useCallback(() => {
    setStatus("error");
  }, []);

  return { status, GraphComponent, retry, fail };
}
