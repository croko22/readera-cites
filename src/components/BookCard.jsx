import React from "react";
import { Link } from "react-router-dom";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export const BookCard = ({ libro, bookKey }) => {
  const progress = Math.round(JSON.parse(libro.data.doc_position).ratio * 100);

  return (
    <AccordionItem
      value={bookKey.toString()}
      className="panel motion-lift mb-4 overflow-hidden rounded-xl border-0"
    >
      <div className="rounded-t-xl border-l-4 border-amber-500 bg-[rgba(18,18,26,0.8)]">
        <AccordionTrigger className="px-4 py-3 text-slate-100 hover:no-underline [&>svg]:text-slate-400">
          <div className="flex flex-1 min-w-0 justify-between items-center pr-4">
            <Link
              to={`/book/${libro.data.doc_md5}`}
              state={libro}
              className="text-slate-100 no-underline transition-colors hover:text-amber-400"
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="mb-0 flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
                {libro.data.doc_file_name_title}
                {libro.data.doc_favorites_time !== 0 && (
                  <Badge className="border-0 bg-amber-500 text-slate-900">⭐ Fav</Badge>
                )}
              </h5>
            </Link>
            <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {libro.citations.length} quotes
            </span>
          </div>
        </AccordionTrigger>
      </div>

      <AccordionContent className="bg-[rgba(26,26,36,0.4)] px-4 py-3 backdrop-blur-sm">
        <p className="mb-2 flex justify-between text-sm text-slate-300">
          <span>
            <b className="text-slate-200">Author:</b> {libro.data.doc_authors}
          </span>
          <span>
            Rating:{" "}
            {libro.data.doc_rating > 0
              ? "⭐".repeat(libro.data.doc_rating)
              : "None"}
          </span>
        </p>
        <div className="space-y-2">
          <div className="text-sm text-slate-400">
            Progress: {progress}%
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
