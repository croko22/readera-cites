import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  INITIAL_PANEL_MATCHES,
  PANEL_MATCHES_INCREMENT,
} from "../../lib/insightsModel";
import { getCitationTimestamp, formatDate } from "../../lib/readeraVocab";

function formatPage(value) {
  return value == null ? "Page unavailable" : `Page ${value}`;
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
      <aside className="panel rounded-xl border-border p-4" aria-live="polite">
        <h2 className="text-sm font-semibold text-foreground">Selection</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a book in graph or list to inspect matched citations.
        </p>
      </aside>
    );
  }

  return (
    <aside className="panel rounded-xl border-border p-4" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{selectedBook.title}</h2>
          <p className="truncate text-xs text-muted-foreground">{selectedBook.author}</p>
        </div>
        <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          {selectedBook.matchCount} matches
        </span>
      </div>

      <div className="mt-3">
        <Link
          to={`/book/${selectedBook.bookId}`}
          className="inline-flex items-center rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:border-ring/50 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open book ${selectedBook.title}`}
        >
          Open Book
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {shown.map((cite, idx) => (
          <article
            key={`${selectedBook.bookId}-${idx}`}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2"
          >
            <p className="text-sm text-foreground">{cite.snippet || "No preview available"}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{formatPage(cite.note_page)}</span>
              <span>{formatDate(getCitationTimestamp(cite))}</span>
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
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:border-ring/50 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reveal {Math.min(remaining, PANEL_MATCHES_INCREMENT)} more
        </button>
      )}
    </aside>
  );
};
