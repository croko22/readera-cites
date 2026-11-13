import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";
import {
  getBookTitle,
  getBookAuthor,
  getBookLastReadTime,
  formatRelativeTime,
} from "../lib/readeraVocab";

export const LibraryPulse = ({ lastReadBook, thisWeekCount }) => {
  const lastReadTime = lastReadBook ? getBookLastReadTime(lastReadBook) : 0;
  const lastReadLabel = lastReadTime ? formatRelativeTime(lastReadTime) : "";
  const highlightLabel =
    thisWeekCount === 1 ? "1 highlight this week" : `${thisWeekCount} highlights this week`;

  return (
    <section
      aria-label="Reading activity"
      className={`mb-5 grid gap-3 ${
        lastReadBook ? "sm:grid-cols-[minmax(0,1fr)_16rem]" : ""
      }`}
    >
      {lastReadBook ? (
        <article className="panel rounded-2xl border-border p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Continue reading
          </p>
          <h2 className="mt-1 line-clamp-2 min-w-0 text-xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">
            {getBookTitle(lastReadBook)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {getBookAuthor(lastReadBook) ? `${getBookAuthor(lastReadBook)} · ` : ""}
            Last read {lastReadLabel}
          </p>
          <Link
            to={`/book/${lastReadBook.data.doc_md5}`}
            state={lastReadBook}
            aria-label={`Continue reading ${getBookTitle(lastReadBook)}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Open book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      ) : null}

      <article className="panel rounded-2xl border-border p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          This week
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-primary">
          {thisWeekCount}
        </p>
        <p className="text-sm text-muted-foreground">{highlightLabel}</p>
        <Link
          to="/timeline"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <Clock3 className="h-4 w-4" />
          Recent highlights
          <ArrowRight className="h-4 w-4" />
        </Link>
      </article>
    </section>
  );
};
