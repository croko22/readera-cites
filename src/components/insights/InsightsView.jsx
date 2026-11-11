import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BOOK_NODE_INCREMENT,
  MAX_BOOK_NODES,
  buildInsightsModel,
} from "../../lib/insightsModel";
import { InsightsFallbackList } from "./InsightsFallbackList";
import { InsightsSidePanel } from "./InsightsSidePanel";
import { InsightsSkeleton } from "../Skeleton";
import { GraphErrorBoundary } from "./GraphErrorBoundary";

function getInitialSelection(modelBooks, selectedBookId) {
  if (!Array.isArray(modelBooks) || modelBooks.length === 0) {
    return null;
  }

  if (selectedBookId && modelBooks.some((book) => book.bookId === selectedBookId)) {
    return selectedBookId;
  }

  return modelBooks[0].bookId;
}

export const InsightsView = ({ books, query, loadGraph = () => import("./InsightsGraph") }) => {
  const normalizedQuery = String(query || "");
  const [debouncedQuery, setDebouncedQuery] = useState(normalizedQuery);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [visibleBookCount, setVisibleBookCount] = useState(MAX_BOOK_NODES);
  const [showListOnly, setShowListOnly] = useState(false);
  const [graphStatus, setGraphStatus] = useState("idle");
  const [GraphComponent, setGraphComponent] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(normalizedQuery), 200);
    return () => window.clearTimeout(handle);
  }, [normalizedQuery]);

  const indexing = normalizedQuery !== debouncedQuery;

  const model = useMemo(() => {
      return buildInsightsModel(books || [], debouncedQuery, {
        maxNodes: visibleBookCount,
      });
  }, [books, debouncedQuery, visibleBookCount]);

  useEffect(() => {
    if (!debouncedQuery.trim() || !model.books.length) {
      setSelectedBookId(null);
      return;
    }

    setSelectedBookId((current) => getInitialSelection(model.books, current));
  }, [debouncedQuery, model.books]);

  const loadWithTimeout = useCallback((importPromise, ms = 10000) =>
    Promise.race([
      importPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Graph import timed out")), ms)
      ),
    ]),
  []);

  useEffect(() => {
    if (graphStatus !== "idle") return;
    if (!debouncedQuery.trim() || model.books.length === 0 || showListOnly) return;

    setGraphStatus("loading");
    loadWithTimeout(loadGraph(), 10000)
      .then((mod) => {
        if (!isMountedRef.current) return;
        setGraphComponent(() => mod.default || mod.InsightsGraph);
        setGraphStatus("ready");
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        setGraphStatus("error");
      });
  }, [debouncedQuery, model.books.length, graphStatus, showListOnly, loadWithTimeout, loadGraph]);

  const selectedBook = useMemo(
    () => model.books.find((book) => book.bookId === selectedBookId) || null,
    [model.books, selectedBookId]
  );

  const announcement = selectedBook
    ? `Selected: ${selectedBook.title}, ${selectedBook.matchCount} matches`
    : "No book selected";

  const canLoadMoreBooks = model.totalMatchedBooks > visibleBookCount;

  return (
    <section className="mt-5 space-y-4" aria-label="Insights mode">
      <header className="panel rounded-xl border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Insights
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Query-to-book relationship explorer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visual map and grouped list stay in sync. You can complete all actions without the graph.
        </p>
      </header>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {!debouncedQuery.trim() ? (
        <div className="panel rounded-xl border-border px-4 py-6 text-sm text-muted-foreground">
          Type a query to explore where it appears across your books.
        </div>
      ) : indexing ? (
        <InsightsSkeleton />
      ) : model.totalMatchedBooks === 0 ? (
        <div className="panel rounded-xl border-border px-4 py-6">
          <h3 className="text-sm font-semibold text-foreground">No matches found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Refine your query, adjust filters, or switch search mode.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            {graphStatus === "loading" && (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-500 border-t-transparent" />
                <span className="text-sm">Loading graph...</span>
              </div>
            )}

            {!showListOnly && graphStatus === "ready" && GraphComponent ? (
              <GraphErrorBoundary
                onError={() => setGraphStatus("error")}
                fallback={
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Graph render error. List + side panel still work.
                  </div>
                }
              >
                <GraphComponent
                  model={model}
                  selectedBookId={selectedBookId}
                  onSelectBook={setSelectedBookId}
                  onUseListView={() => setShowListOnly(true)}
                />
              </GraphErrorBoundary>
            ) : null}

            {graphStatus === "error" && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span>Graph is unavailable in this session. List and side panel remain fully functional.</span>
                <button
                  onClick={() => setGraphStatus("idle")}
                  className="ml-auto shrink-0 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  Retry Graph
                </button>
              </div>
            )}

            <InsightsFallbackList
              books={model.books}
              selectedBookId={selectedBookId}
              onSelectBook={setSelectedBookId}
              visibleCount={visibleBookCount}
              totalCount={model.totalMatchedBooks}
              onLoadMore={() =>
                setVisibleBookCount((current) =>
                  Math.min(current + BOOK_NODE_INCREMENT, model.totalMatchedBooks)
                )
              }
            />

            {canLoadMoreBooks ? (
              <p className="text-xs text-muted-foreground">
                Results are capped for performance. Use "Show more" to progressively reveal additional books.
              </p>
            ) : null}
          </div>

          <InsightsSidePanel
            selectedBook={selectedBook}
            query={model.query}
          />
        </div>
      )}
    </section>
  );
};
