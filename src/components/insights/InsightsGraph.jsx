import React, { useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";

function createElements(nodes, edges, selectedBookId) {
  const graphNodes = nodes.map((node) => ({
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      weight: node.weight,
      bookId: node.bookId,
      selected: node.bookId && node.bookId === selectedBookId,
    },
  }));

  const graphEdges = edges.map((edge) => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
    },
  }));

  return [...graphNodes, ...graphEdges];
}

const cytoscapeStylesheet = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "font-size": 11,
      "text-wrap": "ellipsis",
      "text-max-width": 120,
      color: "#e2e8f0",
      "background-color": "#334155",
      "border-width": 1,
      "border-color": "#64748b",
      "text-valign": "center",
      "text-halign": "center",
      width: "mapData(weight, 1, 25, 24, 42)",
      height: "mapData(weight, 1, 25, 24, 42)",
    },
  },
  {
    selector: 'node[type = "query"]',
    style: {
      shape: "round-rectangle",
      "background-color": "#f59e0b",
      color: "#111827",
      "font-weight": 700,
      "border-color": "#fcd34d",
      width: "label",
      height: 34,
      padding: "10px",
    },
  },
  {
    selector: 'node[type = "book"]',
    style: {
      shape: "ellipse",
      "background-color": "#1e293b",
      "border-color": "#94a3b8",
    },
  },
  {
    selector: "node[selected = 1]",
    style: {
      "background-color": "#f59e0b",
      color: "#111827",
      "border-color": "#fcd34d",
      "border-width": 2,
    },
  },
  {
    selector: "edge",
    style: {
      width: "mapData(weight, 1, 25, 1, 5)",
      "line-color": "#64748b",
      opacity: 0.85,
      "curve-style": "bezier",
    },
  },
];

export const InsightsGraph = ({
  model,
  selectedBookId,
  onSelectBook,
  onUseListView,
}) => {
  const elements = useMemo(
    () => createElements(model.nodes, model.edges, selectedBookId),
    [model.nodes, model.edges, selectedBookId]
  );

  if (!model.nodes.length) {
    return null;
  }

  return (
    <section
      className="panel rounded-xl border-white/15 p-3"
      aria-label="Insights graph"
      aria-describedby="insights-graph-help"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p id="insights-graph-help" className="text-xs text-slate-400">
          Select a book node to inspect matched citations in the side panel.
        </p>
        <button
          type="button"
          onClick={onUseListView}
          className="rounded-md border border-white/10 px-2 py-1 text-xs font-semibold text-slate-300 transition-colors hover:border-amber-400/40 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Use list view
        </button>
      </div>

      <div className="h-[280px] rounded-lg border border-white/10 bg-[rgba(10,12,20,0.76)] sm:h-[340px]">
        <CytoscapeComponent
          elements={elements}
          stylesheet={cytoscapeStylesheet}
          layout={{ name: "breadthfirst", directed: true, spacingFactor: 1.25 }}
          style={{ width: "100%", height: "100%" }}
          cy={(cy) => {
            cy.on("tap", "node", (event) => {
              const node = event.target;
              const type = node.data("type");
              const bookId = node.data("bookId");
              if (type === "book" && bookId) {
                onSelectBook(bookId);
              }
            });
          }}
        />
      </div>

      {model.truncated && model.hiddenBooksCount > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          Showing top matches in graph. {model.hiddenBooksCount} more books available in the list below.
        </p>
      )}
    </section>
  );
};
