import { useState, useRef, useEffect } from "react";
import { Cite } from "./Cite";
import { Button } from "./ui/button";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function getColumnsForWidth(width) {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

function distributeToColumns(items, columnCount) {
  if (columnCount <= 1) {
    return [items.map((item, i) => ({ item, visualIndex: i }))];
  }
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => {
    columns[i % columnCount].push({ item, visualIndex: i });
  });
  return columns;
}

const PAGE_BTN =
  "motion-lift border-border bg-secondary text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80";

export const CitesList = ({ cites, view = "list" }) => {
  const [requestedPage, setPage] = useState(1);
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(3);

  const perPage = view === "grid" ? 20 : 10;
  const totalPages = Math.max(Math.ceil(cites.length / perPage), 1);
  const page = Math.min(requestedPage, totalPages);
  const pagesToShow = totalPages > 10 ? 10 : totalPages;
  let startPage = Math.max(page - Math.floor(pagesToShow / 2), 1);
  let endPage = Math.min(page + Math.floor(pagesToShow / 2), totalPages);

  useEffect(() => {
    setPage(1);
  }, [cites, view]);

  useEffect(() => {
    if (view !== "grid") return;
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setColumnCount(getColumnsForWidth(el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const paginate = (position) => {
    return (
      <nav aria-label={`Citation pages, ${position}`} className="my-6 flex flex-wrap items-center justify-center gap-2 [&_button]:min-h-11 [&_button]:min-w-11">
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(1)}
          aria-label="First page"
          disabled={page === 1}
          className={PAGE_BTN}
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => page > 1 && setPage(page - 1)}
          aria-label="Previous page"
          disabled={page === 1}
          className={PAGE_BTN}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span aria-hidden="true" className="px-4 text-muted-foreground/70">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </span>
        {Array(endPage - startPage + 1)
          .fill("")
          .map((_, i) => (
            <Button
              key={i}
              variant={i + startPage === page ? "default" : "outline"}
              size="default"
              onClick={() => setPage(i + startPage)}
              aria-label={`Page ${i + startPage}`}
              aria-current={i + startPage === page ? "page" : undefined}
               className={i + startPage === page ? "motion-lift border border-primary" : PAGE_BTN}
              >
              {i + startPage}
            </Button>
          ))}
        <span aria-hidden="true" className="px-4 text-muted-foreground/70">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </span>
        <Button
          variant="outline"
          size="default"
          onClick={() => page < totalPages && setPage(page + 1)}
          aria-label="Next page"
          disabled={page >= totalPages}
          className={PAGE_BTN}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(totalPages)}
          aria-label="Last page"
          disabled={page === totalPages}
          className={PAGE_BTN}
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </nav>
    );
  };

  const pageItems = cites.slice((page - 1) * perPage, page * perPage);

  return (
    <div ref={gridRef}>
      {paginate("top")}
      <div key={view} className="view-enter">
        {view === "list" ? (
          <ul className="space-y-2 mt-2 mb-2">
            {pageItems.map((cite, index) => (
              <Cite key={index} cite={cite} variant="list" index={index} />
            ))}
          </ul>
        ) : (
          <div
            className="grid gap-3 sm:gap-4"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {distributeToColumns(pageItems, columnCount).map((col, colIdx) => (
              <ul key={colIdx} className="min-w-0 space-y-3 sm:space-y-4">
                {col.map(({ item, visualIndex }) => (
                  <Cite
                    key={visualIndex}
                    cite={item}
                    variant="grid"
                    index={visualIndex}
                  />
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>
      {paginate("bottom")}
    </div>
  );
};
