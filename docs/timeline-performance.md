# Keep timeline rendering bounded

The timeline renders at most **50 citations per page**, regardless of library size or date grouping. Previous/Next navigation keeps every citation accessible without mounting the whole library at once.

## Cause and correction

The original timeline rendered every group and every `Cite` component immediately. A 5,000-citation fixture mounted 5,000 copy controls and 85,647 DOM elements. Changing grouping also incurred substantial rendering work. Pure date grouping was much cheaper than mounting the complete interface in this benchmark.

`src/lib/timelinePagination.js` now selects a page across group boundaries. It preserves citation references and order without mutating the input. `src/pages/Timeline.jsx` memoizes that selection independently of the complete timeline model, so page navigation does not rebuild the date groups.

### Behavior to preserve

- The 50-item limit applies across all visible groups, not separately to each group. A single large day and many small days must both remain bounded.
- Changing book scope, grouping, or chronological order returns to page one.
- Group headings retain their complete group counts; the page status identifies the displayed highlight range and total.
- Undated citations remain last in either chronological direction and are reachable through pagination.
- Source links, page-only entries, and copy/share actions remain available on visible citations.
- Pagination changes presentation only; it does not write to storage or discard citations.

## Measured improvement

An external Vitest/jsdom harness mounted the real `Timeline` and `Cite` components with mocked storage and deterministic synthetic fixtures. The 5,000-citation fixture spanned ten books, multiple dates, and undated entries. The baseline was commit `6952a0a`; the optimized measurements came from the local pagination implementation on November 13, 2026.

| Measurement, 5,000 citations | Before | After |
| --- | ---: | ---: |
| Initial mount | 21,246 ms | 70.6 ms |
| Switch to Week grouping | 19,454 ms | 78.8 ms |
| Mounted copy controls | 5,000 | 50 |
| DOM elements | 85,647 | 900 |

These are individual synthetic development/jsdom measurements, **not production browser timings, device benchmarks, or a latency guarantee**. The temporary timing harness was removed after verification. The regression tests preserve the rendering bound and behavior, not those exact timings. Production browser testing with representative libraries remains necessary for layout, paint, scrolling, and real-device responsiveness.

## Regression checks

```bash
bun run test -- src/lib/timelinePagination.test.js src/pages/Timeline.test.jsx
bun run test
bun run build
```

The focused tests cover a 5,000-highlight library, one oversized day, cross-group page boundaries, complete traversal, previous/next limits, control-change resets, undated entries, and input immutability. At implementation verification, all **203 tests** and the production build passed.

Keep mounted-item counts as deterministic regression assertions rather than enforcing machine-dependent timing thresholds. For future performance work, measure model computation separately from component mounting and compare the same fixture before and after the change. Memoization or CSS alone must not replace the mounted-item bound.
