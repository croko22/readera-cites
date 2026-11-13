import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDown, ArrowUp, Clock3 } from "lucide-react";
import { Cite } from "../components/Cite";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { getBooks } from "../lib/booksStorage";
import { getBookAuthor, getBookTitle } from "../lib/readeraVocab";
import { buildCitationTimeline } from "../lib/timelineModel";
import { getTimelinePage, TIMELINE_PAGE_SIZE } from "../lib/timelinePagination";

const GRANULARITIES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

function getCitationCount(books) {
  return books.reduce(
    (total, book) =>
      total + (Array.isArray(book?.citations) ? book.citations.length : 0),
    0
  );
}

export const Timeline = () => {
  const [books, setBooks] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState("all");
  const [granularity, setGranularity] = useState("day");
  const [order, setOrder] = useState("newest");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getBooks()
      .then((stored) => {
        if (cancelled) return;
        if (!stored) {
          navigate("/upload");
          return;
        }
        setBooks(stored);
      })
      .catch(() => {
        if (!cancelled) navigate("/upload");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const bookOptions = useMemo(
    () =>
      (books || []).map((book) => ({
        id: book.data.doc_md5,
        title: getBookTitle(book) || "Untitled book",
      })),
    [books]
  );

  const scopedBooks = useMemo(() => {
    if (!books) return [];
    if (selectedBookId === "all") return books;
    return books.filter((book) => book.data.doc_md5 === selectedBookId);
  }, [books, selectedBookId]);

  const timeline = useMemo(
    () => buildCitationTimeline(scopedBooks, { granularity, order }),
    [scopedBooks, granularity, order]
  );

  const allCitationCount = useMemo(() => getCitationCount(books || []), [books]);
  const scopedCitationCount = useMemo(
    () => getCitationCount(scopedBooks),
    [scopedBooks]
  );

  const visibleGroups = useMemo(
    () => getTimelinePage(timeline, page),
    [timeline, page]
  );
  const pageCount = Math.ceil(scopedCitationCount / TIMELINE_PAGE_SIZE);
  const firstVisible = page * TIMELINE_PAGE_SIZE + 1;
  const lastVisible = Math.min((page + 1) * TIMELINE_PAGE_SIZE, scopedCitationCount);

  if (!books) {
    return (
      <div className="container mx-auto mb-10 mt-7 px-4">
        <div className="panel mb-4 h-28 animate-pulse rounded-2xl" />
        <div className="panel mb-4 h-14 animate-pulse rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="panel h-28 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasNoHighlights = allCitationCount === 0;
  const hasEmptyBook =
    selectedBookId !== "all" && scopedCitationCount === 0 && !hasNoHighlights;

  return (
    <div className="container mx-auto mb-10 mt-7 px-4">
      <Link
        to="/"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Link>

      <header className="panel mb-5 rounded-2xl border-border px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Reading practice
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Recent highlights
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Browse every saved highlight by the day you captured it. Return to a
          passage, follow your notes, and open the source book.
        </p>
      </header>

      <div className="panel mb-5 flex flex-wrap items-center gap-3 rounded-xl border-border p-3">
        <label className="flex w-full min-w-0 flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:w-auto sm:flex-1 sm:max-w-xs">
          Book scope
          <select
            aria-label="Book scope"
            value={selectedBookId}
            onChange={(event) => {
              setSelectedBookId(event.target.value);
              setPage(0);
            }}
            className="h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm font-medium normal-case tracking-normal text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All books</option>
            {bookOptions.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </label>

        <div role="group" aria-label="Group by" className="flex flex-wrap gap-2">
          {GRANULARITIES.map((option) => (
            <Button
              key={option.key}
              type="button"
              variant={granularity === option.key ? "default" : "outline"}
              aria-pressed={granularity === option.key}
              onClick={() => {
                setGranularity(option.key);
                setPage(0);
              }}
              className="min-h-11 min-w-11"
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOrder((current) => (current === "newest" ? "oldest" : "newest"));
            setPage(0);
          }}
          className="min-h-11 gap-2"
        >
          {order === "newest" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
          {order === "newest" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {hasNoHighlights ? (
        <EmptyState
          icon="book"
          title="No highlights yet"
          description="Import a ReadEra backup to browse your saved passages by date."
          actionLabel="Upload backup"
          onAction={() => navigate("/upload")}
        />
      ) : hasEmptyBook ? (
        <EmptyState
          icon="search"
          title="No highlights in this book"
          description="Choose another book or return to the whole library."
          actionLabel="Show all books"
          onAction={() => setSelectedBookId("all")}
        />
      ) : (
        <>
          <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
            {scopedCitationCount} highlight
            {scopedCitationCount === 1 ? "" : "s"} in {timeline.length} group
            {timeline.length === 1 ? "" : "s"}
          </p>

          <div className="space-y-7">
            {visibleGroups.map((group) => {
              const headingId = `timeline-${group.key.replace(/[^a-z0-9-]/gi, "-")}`;
              return (
                <section key={group.key} aria-labelledby={headingId}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h2
                      id={headingId}
                      className="text-lg font-semibold tracking-tight text-foreground"
                    >
                      {group.label}
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.count} highlight{group.count === 1 ? "" : "s"}
                    </span>
                  </div>

                  {group.key === "undated" ? (
                    <p className="mb-2 text-xs text-muted-foreground">
                      The backup did not include a valid timestamp for these
                      highlights.
                    </p>
                  ) : null}

                  <ul className="space-y-2">
                    {group.items.map((item) => {
                      const bookTitle =
                        item.bookTitle || getBookTitle(item.book) || "Untitled book";
                      const author = getBookAuthor(item.book);
                      return (
                        <Cite
                          key={`${item.book.data.doc_md5}:${item.originalIndex}`}
                          cite={item.citation}
                          source={
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Link
                                to={`/book/${item.book.data.doc_md5}`}
                                state={item.book}
                                aria-label={`Open ${bookTitle} in book view`}
                                className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                              >
                                {bookTitle}
                              </Link>
                              {author ? <span>· {author}</span> : null}
                            </span>
                          }
                          emptyLabel="Page bookmark"
                        />
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
          {pageCount > 1 ? (
            <nav
              aria-label="Timeline pages"
              className="mt-5 flex flex-wrap items-center justify-between gap-3"
            >
              <Button
                type="button"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous page
              </Button>
              <p role="status" className="text-sm text-muted-foreground">
                Page {page + 1} of {pageCount} · Highlights {firstVisible}–{lastVisible} of {scopedCitationCount}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next page
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
};
