import React from "react";
import { BOOK_NODE_INCREMENT } from "../../lib/insightsModel";

export const InsightsFallbackList = ({
  books,
  selectedBookId,
  onSelectBook,
  visibleCount,
  totalCount,
  onLoadMore,
}) => {
  const sourceBooks = Array.isArray(books) ? books : [];
  const visibleBooks = sourceBooks.slice(0, visibleCount);
  const resultCount = totalCount ?? sourceBooks.length;
  const hiddenCount = Math.max(resultCount - visibleBooks.length, 0);

  return (
    <section className="panel rounded-xl border-border p-3" aria-label="Insights grouped list">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Matched books</h2>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {hiddenCount > 0 ? `${visibleBooks.length} of ${resultCount} results` : `${resultCount} results`}
        </span>
      </div>

      {visibleBooks.length === 0 ? (
        <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
          No books match this query.
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleBooks.map((book) => {
            const active = selectedBookId === book.bookId;
            return (
              <li key={book.bookId}>
                <button
                  type="button"
                  onClick={() => onSelectBook(book.bookId)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "border-primary/55 bg-primary/10"
                      : "border-border bg-secondary/40 hover:border-ring/40 hover:bg-secondary"
                  }`}
                  aria-pressed={active}
                  aria-label={`Select ${book.title} with ${book.matchCount} matches`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{book.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {book.matchCount}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:border-ring/50 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Show {Math.min(hiddenCount, BOOK_NODE_INCREMENT)} more ({hiddenCount} remaining)
          </button>
        </div>
      )}
    </section>
  );
};
