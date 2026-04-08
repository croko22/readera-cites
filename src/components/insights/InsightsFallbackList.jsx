import React from "react";

export const InsightsFallbackList = ({
  books,
  selectedBookId,
  onSelectBook,
  visibleCount,
  onLoadMore,
}) => {
  const visibleBooks = books.slice(0, visibleCount);
  const hiddenCount = Math.max(books.length - visibleBooks.length, 0);

  return (
    <section className="panel rounded-xl border-white/15 p-3" aria-label="Insights grouped list">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Matched books</h2>
        <span className="text-xs text-slate-400">{books.length} results</span>
      </div>

      {visibleBooks.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400">
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
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active
                      ? "border-amber-400/55 bg-amber-500/12"
                      : "border-white/10 bg-white/[0.02] hover:border-amber-400/35 hover:bg-amber-500/6"
                  }`}
                  aria-pressed={active}
                  aria-label={`Select ${book.title} with ${book.matchCount} matches`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-100">{book.title}</h3>
                      <p className="truncate text-xs text-slate-400">{book.author}</p>
                    </div>
                    <span className="rounded-full border border-amber-300/35 bg-amber-400/12 px-2 py-0.5 text-xs font-semibold text-amber-300">
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
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-400/45 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Show {Math.min(hiddenCount, 40)} more ({hiddenCount} remaining)
          </button>
        </div>
      )}
    </section>
  );
};
