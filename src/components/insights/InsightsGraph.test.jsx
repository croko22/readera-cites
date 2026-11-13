import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { InsightsGraph } from "./InsightsGraph";

const graph = vi.hoisted(() => ({ props: null, fit: vi.fn(), disconnect: vi.fn(), resize: null }));
vi.mock("react-cytoscapejs", () => ({ default: () => <div data-testid="legacy-graph" /> }));
vi.mock("react-force-graph-2d", async () => {
  const React = await import("react");
  return ({
  default: React.forwardRef((props, ref) => {
    graph.props = props;
    React.useImperativeHandle(ref, () => ({ zoomToFit: graph.fit }));
    return <canvas data-testid="force-graph" />;
  }),
  });
});

const model = {
  nodes: [
    { id: "query", type: "query", label: "focus", weight: 2 },
    { id: "book:b1", type: "book", label: "Deep Work", bookId: "b1", weight: 3 },
  ],
  edges: [{ id: "e1", source: "query", target: "book:b1", weight: 3 }],
  truncated: true,
  hiddenBooksCount: 4,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback) { graph.resize = callback; }
    observe() {}
    disconnect() { graph.disconnect(); }
  });
});
afterEach(() => vi.unstubAllGlobals());

it("uses a bounded, auto-pausing canvas with an isolated stable simulation", () => {
  const { rerender } = render(<InsightsGraph model={model} selectedBookId="b1" />);
  expect(screen.getByTestId("force-graph")).toBeInTheDocument();
  const data = graph.props.graphData;
  expect(data.nodes).toEqual(model.nodes);
  expect(data.links).toEqual(model.edges);
  expect(data.nodes[0]).not.toBe(model.nodes[0]);
  expect(data.links[0]).not.toBe(model.edges[0]);
  expect(graph.props.autoPauseRedraw).toBe(true);
  expect(graph.props.cooldownTicks).toBeGreaterThan(0);
  expect(graph.props.cooldownTicks).toBeLessThanOrEqual(120);
  expect(graph.props.cooldownTime).toBeLessThanOrEqual(3000);
  // The renderer mutates its input; selection must preserve those coordinates.
  data.nodes[1].x = 45;
  data.links[0].source = data.nodes[0];
  const selectedColor = graph.props.nodeColor(data.nodes[1]);
  rerender(<InsightsGraph model={model} selectedBookId={null} />);
  expect(graph.props.graphData).toBe(data);
  expect(graph.props.nodeColor(data.nodes[1])).not.toBe(selectedColor);
  expect(model.nodes[1].x).toBeUndefined();
  expect(model.edges[0].source).toBe("query");
  act(() => graph.props.onEngineStop());
  act(() => graph.props.onEngineStop());
  expect(graph.fit).toHaveBeenCalledTimes(1);
});

it("preserves book selection, list switching, overflow feedback and empty results", () => {
  const onSelectBook = vi.fn();
  const onUseListView = vi.fn();
  const { rerender } = render(<InsightsGraph model={model} onSelectBook={onSelectBook} onUseListView={onUseListView} />);
  act(() => graph.props.onNodeClick(graph.props.graphData.nodes[0]));
  expect(onSelectBook).not.toHaveBeenCalled();
  act(() => graph.props.onNodeClick(graph.props.graphData.nodes[1]));
  expect(onSelectBook).toHaveBeenCalledWith("b1");
  fireEvent.click(screen.getByRole("button", { name: "Use list view" }));
  expect(onUseListView).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/4 more books available/)).toBeInTheDocument();
  rerender(<InsightsGraph model={{ nodes: [], edges: [] }} />);
  expect(screen.queryByRole("region", { name: "Insights graph" })).not.toBeInTheDocument();
});

it("resizes to its container and disconnects its observer", () => {
  const { unmount } = render(<InsightsGraph model={model} />);
  act(() => graph.resize([{ contentRect: { width: 640, height: 340 } }]));
  expect(graph.props.width).toBe(640);
  expect(graph.props.height).toBe(340);
  unmount();
  expect(graph.disconnect).toHaveBeenCalledTimes(1);
});

it("rebuilds and fits a changed dataset, and treats backup labels as text", () => {
  const { rerender } = render(<InsightsGraph model={model} />);
  const previous = graph.props.graphData;
  act(() => graph.props.onEngineStop());
  const next = { ...model, nodes: model.nodes.map((node) => ({ ...node, label: "<img src=x onerror=alert(1)>" })) };
  rerender(<InsightsGraph model={next} />);
  expect(graph.props.graphData).not.toBe(previous);
  const label = graph.props.nodeLabel(graph.props.graphData.nodes[1]);
  expect(label.textContent).toBe(next.nodes[1].label);
  expect(label.querySelector("img")).toBeNull();
  act(() => graph.props.onEngineStop());
  expect(graph.fit).toHaveBeenCalledTimes(2);
});
