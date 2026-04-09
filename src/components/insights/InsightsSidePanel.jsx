import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  INITIAL_PANEL_MATCHES,
  PANEL_MATCHES_INCREMENT,
} from "../../lib/insightsModel";

function formatPage(value) {
  return value == null ? "Page unavailable" : `Page ${value}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "Date unavailable";
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return "Date unavailable";
  }
}

export const InsightsSidePanel = ({ selectedBook, query }) => {
  const [visibleMatches, setVisibleMatches] = useState(INITIAL_PANEL_MATCHES);

  const matches = selectedBook?.matchedCitations || [];
  const shown = useMemo(
    () => matches.slice(0, visibleMatches),
    [matches, visibleMatches]
  );
  const remaining = Math.max(matches.length - shown.length, 0);
  const safeQuery = String(query || "");

  if (!selectedBook) {
    return (
      <aside className="panel rounded-xl border-white/15 p-4" aria-live="polite">
        <h2 className="text-sm font-semibold text-slate-200">Selection</h2>
        <p className="mt-2 text-sm text-slate-400">
          Select a book in graph or list to inspect matched citations.
        </p>
      </aside>
    );
  }

  return (
    <aside className="panel rounded-xl border-white/15 p-4" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-100">{selectedBook.title}</h2>
          <p className="truncate text-xs text-slate-400">{selectedBook.author}</p>
        </div>
        <span className="rounded-full border border-amber-300/35 bg-amber-400/12 px-2 py-0.5 text-xs font-semibold text-amber-300">
          {selectedBook.matchCount} matches
        </span>
      </div>

      <div className="mt-3">
        <Link
          to={`/book/${selectedBook.bookId}`}
          className="inline-flex items-center rounded-md border border-amber-400/35 bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:border-amber-300/65 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label={`Open book ${selectedBook.title}`}
        >
          Open Book
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {shown.map((cite, idx) => (
          <article
            key={`${selectedBook.bookId}-${idx}`}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-sm text-slate-200">{cite.snippet || "No preview available"}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>{formatPage(cite.note_page)}</span>
              <span>{formatDate(cite.note_timestamp)}</span>
              {safeQuery ? <span>Query: {safeQuery}</span> : null}
            </div>
          </article>
        ))}
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() =>
            setVisibleMatches((current) => current + PANEL_MATCHES_INCREMENT)
          }
          className="mt-3 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-400/45 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Reveal {Math.min(remaining, PANEL_MATCHES_INCREMENT)} more
        </button>
      )}
    </aside>
  );
};
