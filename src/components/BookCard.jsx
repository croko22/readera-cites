import React from "react";
import { Link } from "react-router-dom";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { getBookTitle, getBookAuthor, getBookProgress } from "../lib/readeraVocab";

export const BookCard = ({ libro, bookKey }) => {
  const progress = getBookProgress(libro)?.percent ?? 0;
  const title = getBookTitle(libro);

  return (
    <AccordionItem
      value={bookKey.toString()}
      className="panel motion-lift mb-4 overflow-hidden rounded-xl border-0"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-t-xl border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
            <Link
              to={`/book/${libro.data.doc_md5}`}
              state={libro}
              className="min-w-0 text-foreground no-underline transition-colors hover:text-primary"
            >
              <h5 className="mb-0 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
                {libro.data.doc_favorites_time !== 0 && (
                  <Badge className="border border-primary bg-primary text-primary-foreground">Fav</Badge>
                )}
              </h5>
            </Link>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {libro.citations.length} quotes
            </span>
          </div>
        <AccordionTrigger
          aria-label={`Book details for ${title}`}
          className="h-11 w-11 flex-none justify-center rounded-lg p-0 text-foreground hover:bg-secondary hover:no-underline active:bg-secondary/80 [&>svg]:text-muted-foreground"
        />
      </div>

      <AccordionContent className="bg-secondary/40 px-4 py-3">
        <p className="mb-2 flex min-w-0 flex-col gap-2 text-sm text-secondary-foreground sm:flex-row sm:justify-between">
          <span className="min-w-0 [overflow-wrap:anywhere]">
            <b className="text-foreground">Author:</b> {getBookAuthor(libro)}
          </span>
          <span className="shrink-0">
            Rating:{" "}
            {libro.data.doc_rating > 0
              ? "★".repeat(libro.data.doc_rating)
              : "None"}
          </span>
        </p>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Progress: {progress}%
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
