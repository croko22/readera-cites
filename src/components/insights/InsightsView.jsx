import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  BOOK_NODE_INCREMENT,
  MAX_BOOK_NODES,
  buildInsightsModel,
} from "../../lib/insightsModel";
import { InsightsFallbackList } from "./InsightsFallbackList";
import { InsightsSidePanel } from "./InsightsSidePanel";
import { InsightsSkeleton } from "../Skeleton";

const LazyInsightsGraph = lazy(() =>
  import("./InsightsGraph").then((mod) => ({ default: mod.InsightsGraph }))
);

const defaultLoadGraph = () => import("./InsightsGraph");

export const InsightsView = ({ books, query, loadGraph = defaultLoadGraph }) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [visibleBookCount, setVisibleBookCount] = useState(MAX_BOOK_NODES);
  const [showListOnly, setShowListOnly] = useState(false);
  const [graphStatus, setGraphStatus] = useState("idle");
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  const indexing = query !== debouncedQuery;

  const model = useMemo(() => {
    return buildInsightsModel(books || [], debouncedQuery, {
      maxNodes: visibleBookCount,
    });
  }, [books, debouncedQuery, visibleBookCount]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSelectedBookId(null);
      return;
    }

    if (!model.books.length) {
      setSelectedBookId(null);
      return;
    }

    if (
      !selectedBookId ||
      !model.books.some((book) => book.bookId === selectedBookId)
    ) {
      setSelectedBookId(model.books[0].bookId);
    }
  }, [debouncedQuery, model.books, selectedBookId]);

  useEffect(() => {
    if (!debouncedQuery.trim() || showListOnly || graphStatus === "error") {
      return;
    }

    if (graphStatus === "ready" || graphStatus === "loading") {
      return;
    }

    setGraphStatus("loading");
    loadGraph()
      .then(() => {
        if (!isMountedRef.current) return;
        setGraphStatus("ready");
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        setGraphStatus("error");
      });
  }, [debouncedQuery, graphStatus, loadGraph, showListOnly]);

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
      <header className="panel rounded-xl border-white/15 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/80">
          Insights
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">
          Query-to-book relationship explorer
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Visual map and grouped list stay in sync. You can complete all actions without the graph.
        </p>
      </header>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {!debouncedQuery.trim() ? (
        <div className="panel rounded-xl border-white/15 px-4 py-6 text-sm text-slate-400">
          Type a query to explore where it appears across your books.
        </div>
      ) : indexing ? (
        <InsightsSkeleton />
      ) : model.totalMatchedBooks === 0 ? (
        <div className="panel rounded-xl border-white/15 px-4 py-6">
          <h3 className="text-sm font-semibold text-slate-200">No matches found</h3>
          <p className="mt-1 text-sm text-slate-400">
            Refine your query, adjust filters, or switch search mode.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            {!showListOnly && graphStatus === "ready" ? (
              <Suspense fallback={<InsightsSkeleton compact />}>
                <LazyInsightsGraph
                  model={model}
                  selectedBookId={selectedBookId}
                  onSelectBook={setSelectedBookId}
                  onUseListView={() => setShowListOnly(true)}
                />
              </Suspense>
            ) : null}

            {!showListOnly && graphStatus === "loading" ? <InsightsSkeleton compact /> : null}

            {graphStatus === "error" ? (
              <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Graph is unavailable in this session. List and side panel remain fully functional.
              </div>
            ) : null}

            <InsightsFallbackList
              books={model.books}
              selectedBookId={selectedBookId}
              onSelectBook={setSelectedBookId}
              visibleCount={visibleBookCount}
              onLoadMore={() =>
                setVisibleBookCount((current) =>
                  Math.min(current + BOOK_NODE_INCREMENT, model.totalMatchedBooks)
                )
              }
            />

            {canLoadMoreBooks ? (
              <p className="text-xs text-slate-500">
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
