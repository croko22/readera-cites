import React from "react";

/* ── BookCard skeleton ── */
export const BookCardSkeleton = () => (
  <div className="panel mb-4 overflow-hidden rounded-xl">
    {/* Header row */}
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between pr-4">
        <div className="flex-1 min-w-0">
          <div className="animate-pulse h-6 w-3/4 rounded bg-secondary mb-2" />
        </div>
        <div className="animate-pulse h-6 w-24 rounded-full bg-secondary" />
      </div>
    </div>
    {/* Body */}
    <div className="bg-secondary/40 px-4 py-3 space-y-2">
      <div className="flex justify-between">
        <div className="animate-pulse h-4 w-40 rounded bg-secondary" />
        <div className="animate-pulse h-4 w-20 rounded bg-secondary" />
      </div>
      <div className="surface-muted h-2 w-full animate-pulse rounded" />
    </div>
  </div>
);

/* ── Citation skeleton ── */
export const CiteSkeleton = () => (
  <div className="surface-muted mb-4 rounded-xl border border-border p-5">
    <div className="flex justify-between items-start mb-3">
      <span className="flex items-center gap-2">
        <div className="animate-pulse h-6 w-20 rounded-full bg-secondary" />
        <div className="animate-pulse h-5 w-16 rounded-full bg-secondary" />
      </span>
      <span className="flex gap-3">
        <div className="surface-muted h-5 w-5 animate-pulse rounded" />
        <div className="surface-muted h-5 w-5 animate-pulse rounded" />
      </span>
    </div>
    <div className="space-y-2 mb-3">
      <div className="animate-pulse h-4 w-full rounded bg-secondary" />
      <div className="animate-pulse h-4 w-5/6 rounded bg-secondary" />
    </div>
      <div className="surface-muted h-5 w-2/3 animate-pulse rounded-lg" />
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
      <div className="animate-pulse h-9 w-2/3 rounded bg-secondary" />
      <div className="animate-pulse h-10 w-32 rounded-md bg-secondary" />
    </div>
    {/* Search bar placeholder */}
    <div className="animate-pulse h-12 w-full rounded-lg bg-secondary mb-4" />
    {/* Filter buttons */}
    <div className="mt-4 flex justify-between items-center mb-4">
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-10 w-14 rounded-md bg-secondary" />
        ))}
      </div>
      <div className="animate-pulse h-10 w-10 rounded-md bg-secondary" />
    </div>
    {/* Citation cards */}
    <ul className="space-y-2 mt-2 mb-2">
      {Array.from({ length: count }).map((_, i) => (
        <CiteSkeleton key={i} />
      ))}
    </ul>
  </div>
);

export const InsightsSkeleton = ({ compact = false }) => (
  <div className="space-y-3">
    <div className="panel rounded-xl border-border p-3">
      <div className="animate-pulse h-4 w-44 rounded bg-secondary" />
      <div className={`mt-3 w-full rounded-lg border border-border bg-secondary/30 ${compact ? "h-28" : "h-56"}`}>
        <div className="h-full w-full animate-pulse rounded-lg bg-secondary/60" />
      </div>
    </div>
    {!compact && (
      <div className="panel rounded-xl border-border p-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-11 rounded-lg bg-secondary/60" />
        ))}
      </div>
    )}
  </div>
);
