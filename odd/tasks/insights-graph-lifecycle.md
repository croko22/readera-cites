# Insights graph lifecycle

Objective: move optional graph availability out of `InsightsView` into one hook without changing user-facing behavior.
Branch: current working branch. Delivery: uncommitted; user owns delivery.
Test runner: `npm run test` (Vitest).

## Specs

- S1 — Preserve loading policy: load once when the graph is enabled and idle; do not re-import when the query or visible-book count changes; retry only through the explicit Retry Graph action.
- S2 — Own availability in one module: `useInsightsGraph({ enabled, loadGraph, timeoutMs })` returns `{ status, GraphComponent, retry, fail }`. The view keeps debounce, selection, list-only, and the renderer boundary.
- S3 — Settle lifecycle safely: the 10-second timeout is cleared after settlement; a late import resolution cannot overwrite a timeout error; a synchronous loader throw becomes `error`; StrictMode replay performs one import; disallowed or unmounted work cannot update state.
- S4 — Preserve renderer recovery: a renderer crash marks the graph unavailable; Retry Graph reloads it and restores the renderer.
- S5 — Preserve the fallback: the list and side panel remain fully functional in every graph failure state; existing user-facing messages and export behavior do not change.

## Tasks

- T1 — Extract `useInsightsGraph`, route `InsightsView` through it, add hook and retry coverage. Status: done. Commit: none.
- T2 — Run the full suite and production build. Status: done.
- T3 — Independent verification of S1–S5. Status: done, no blockers.

## Log

- L1 (user request, verbatim): "02 / Optional visualization

Deepen graph lifecycle ownership
Worth exploring
in-process

src/components/insights/InsightsView.jsx · InsightsGraph.jsx · GraphErrorBoundary.jsx
src/lib/insightsModel.js · src/components/insights/InsightsView.test.jsx

Before / lifecycle mixed with browsing
Insights view

Selection and list

Lazy import

Timeout and mount tracking

Retry and failure

Graph renderer

After / availability consumed by view
Insights browsing module
↓ availability seam
Optional graph lifecycle module
Acquire
Dispose
Fail
Retry
Existing renderer adapter stays isolated.
Problem
Graph acquisition and recovery policy share an owner with selection, debounce, and list browsing.
Solution
Make one module own lifecycle transitions so callers consume graph availability without coordinating its mechanics.
Deletion test
The renderer module already has depth. Moving setters into a shallow module would not reduce caller knowledge.
Adapter
One current renderer adapter; no evidence justifies interchangeable renderers or a new adapter seam.
Tradeoff
One caller already has regression tests. Extraction must improve locality enough to outweigh extra navigation.
Locality: lifecycle transitions together
Leverage: focused failure tests
Interface hides lifecycle mechanics
Evidence: InsightsView.jsx:24–45, 64–88, 142–168; InsightsView.test.jsx:24–68. Recent commits: f658d0c replay repair; be483b6 bounded graph migration.

Keep existing list fallback and replay tests. Do not reopen the completed renderer migration. New lifecycle tests would target timeout, retry, disposal, and late resolution—not duplicate all browsing tests."
- L2 (user decision, verbatim): "YEAH I APPROVE"
- L3 — Parent evidence: focused Insights tests 17 passed; full suite 220 passed across 19 files; production build passed.
- L4 — Corrected premise: the boundary unmounts when status becomes `error`, so Retry already recovered renderer crashes. The temporary `attempt` key was redundant; it was removed. The retry test remains as regression coverage.
- L5 — Tracking was created after implementation when the async-ordering risk was classified; no commits were made.
- L6 — Independent verifier: no blockers; S1–S5 met; advisories were an unmount-timeout cleanup limit, an unobservable React 19 unmount guard, and a pre-existing unused React default import. Its passing probes were added as `useInsightsGraph.lifecycle.test.jsx` and `InsightsView.graphFailure.test.jsx`.
- L7 — Final parent evidence: focused Insights tests 29 passed; full suite 232 passed across 21 files; production build passed.
