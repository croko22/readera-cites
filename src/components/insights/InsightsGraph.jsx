import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const nodeValue = (node) => Math.min(25, Math.max(1, node.weight || 1));
const linkWidth = (link) => Math.min(3, Math.max(0.5, Math.sqrt(link.weight || 1) / 2));
const linkColor = () => "#64748b";
const afterNode = () => "after";

// Use textContent rather than the renderer's HTML tooltip string API for backup data.
function nodeLabel(node) {
  const label = document.createElement("span");
  label.textContent = node.label;
  return label;
}

export const InsightsGraph = ({ model, selectedBookId, onSelectBook, onUseListView }) => {
  // The force engine mutates nodes and links. Never give it the shared insights model.
  // Selection deliberately does not invalidate the simulation or its coordinates.
  const graphData = useMemo(() => ({
    nodes: model.nodes.map((node) => ({ ...node })),
    links: model.edges.map((edge) => ({ ...edge })),
  }), [model.nodes, model.edges]);
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const fittedDataRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const hasNodes = graphData.nodes.length > 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resize = ({ width, height }) => {
      const next = { width: Math.max(0, Math.floor(width)), height: Math.max(0, Math.floor(height)) };
      setSize((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
    };
    resize(container.getBoundingClientRect());
    if (typeof ResizeObserver === "undefined") {
      const measure = () => resize(container.getBoundingClientRect());
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(([entry]) => resize(entry.contentRect));
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasNodes]);

  const colorNode = useCallback((node) =>
    node.type === "query" || node.bookId === selectedBookId ? "#f59e0b" : "#94a3b8",
  [selectedBookId]);
  const selectNode = useCallback((node) => {
    if (node.type === "book" && node.bookId) onSelectBook?.(node.bookId);
  }, [onSelectBook]);
  const paintLabel = useCallback((node, context, scale) => {
    const highlighted = node.type === "query" || node.bookId === selectedBookId;
    if (!highlighted && scale < 1.8) return;
    const text = node.label.length > 32 ? `${node.label.slice(0, 31)}…` : node.label;
    context.font = `${12 / scale}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#e2e8f0";
    context.fillText(text, node.x, node.y + Math.sqrt(nodeValue(node)) * 4 + 3 / scale);
  }, [selectedBookId]);
  const fitOnce = useCallback(() => {
    if (fittedDataRef.current === graphData) return;
    graphRef.current?.zoomToFit(0, 32);
    fittedDataRef.current = graphData;
  }, [graphData]);

  if (!hasNodes) return null;

  return (
    <section className="panel min-w-0 rounded-xl border-border p-3" aria-label="Insights graph" aria-describedby="insights-graph-help">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p id="insights-graph-help" className="text-xs text-muted-foreground">
          Select a book node to inspect matched citations in the side panel.
        </p>
        <button type="button" onClick={onUseListView} className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:border-ring/50 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Use list view
        </button>
      </div>
      <div ref={containerRef} className="h-[280px] overflow-hidden rounded-lg border border-border bg-card sm:h-[340px]">
        <ForceGraph2D
          ref={graphRef}
          width={size.width}
          height={size.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeVal={nodeValue}
          nodeColor={colorNode}
          nodeLabel={nodeLabel}
          nodeCanvasObject={paintLabel}
          nodeCanvasObjectMode={afterNode}
          linkColor={linkColor}
          linkWidth={linkWidth}
          cooldownTicks={100}
          cooldownTime={2500}
          autoPauseRedraw={true}
          onEngineStop={fitOnce}
          onNodeClick={selectNode}
        />
      </div>
      {model.truncated && model.hiddenBooksCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing top matches in graph. {model.hiddenBooksCount} more books available in the list below.
        </p>
      )}
    </section>
  );
};
