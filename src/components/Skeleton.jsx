import React from "react";

/* ── BookCard skeleton ── */
export const BookCardSkeleton = () => (
  <div className="rounded-xl mb-4 overflow-hidden bg-[rgba(26,26,36,0.6)] border border-white/10">
    {/* Header row */}
    <div className="bg-[rgba(18,18,26,0.8)] border-l-4 border-amber-500/20 px-4 py-3">
      <div className="flex items-center justify-between pr-4">
        <div className="flex-1 min-w-0">
          <div className="animate-pulse h-6 w-3/4 rounded bg-white/5 mb-2" />
        </div>
        <div className="animate-pulse h-6 w-24 rounded-full bg-white/5" />
      </div>
    </div>
    {/* Body */}
    <div className="px-4 py-3 bg-[rgba(26,26,36,0.4)] space-y-2">
      <div className="flex justify-between">
        <div className="animate-pulse h-4 w-40 rounded bg-white/5" />
        <div className="animate-pulse h-4 w-20 rounded bg-white/5" />
      </div>
      <div className="animate-pulse h-2 w-full rounded bg-white/5" />
    </div>
  </div>
);

/* ── Citation skeleton ── */
export const CiteSkeleton = () => (
  <div className="p-5 rounded-xl mb-4 bg-white/5 border-l-4 border-slate-600/30">
    <div className="flex justify-between items-start mb-3">
      <span className="flex items-center gap-2">
        <div className="animate-pulse h-6 w-20 rounded-full bg-white/5" />
        <div className="animate-pulse h-5 w-16 rounded-full bg-white/5" />
      </span>
      <span className="flex gap-3">
        <div className="animate-pulse h-5 w-5 rounded bg-white/5" />
        <div className="animate-pulse h-5 w-5 rounded bg-white/5" />
      </span>
    </div>
    <div className="space-y-2 mb-3">
      <div className="animate-pulse h-4 w-full rounded bg-white/5" />
      <div className="animate-pulse h-4 w-5/6 rounded bg-white/5" />
    </div>
    <div className="animate-pulse h-5 w-2/3 rounded-lg bg-white/5" />
  </div>
);

/* ── Grid of N skeletons ── */
export const LibrarySkeleton = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

export const BookSkeleton = ({ count = 4 }) => (
  <div>
    {/* Title bar */}
    <div className="flex justify-between items-center mb-4">
      <div className="animate-pulse h-9 w-2/3 rounded bg-white/5" />
      <div className="animate-pulse h-10 w-32 rounded-md bg-white/5" />
    </div>
    {/* Search bar placeholder */}
    <div className="animate-pulse h-12 w-full rounded-lg bg-white/5 mb-4" />
    {/* Filter buttons */}
    <div className="mt-4 flex justify-between items-center mb-4">
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-10 w-14 rounded-md bg-white/5" />
        ))}
      </div>
      <div className="animate-pulse h-10 w-10 rounded-md bg-white/5" />
    </div>
    {/* Citation cards */}
    <ul className="space-y-2 mt-2 mb-2">
      {Array.from({ length: count }).map((_, i) => (
        <CiteSkeleton key={i} />
      ))}
    </ul>
  </div>
);
