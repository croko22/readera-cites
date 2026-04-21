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
  "motion-lift border-white/12 bg-white/[0.03] text-slate-300 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/12 hover:text-amber-300";

export const CitesList = ({ cites, view = "list" }) => {
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(3);

  const perPage = view === "grid" ? 20 : 10;
  const totalPages = Math.max(Math.ceil(cites.length / perPage), 1);
  const pagesToShow = totalPages > 10 ? 10 : totalPages;
  let startPage = Math.max(page - Math.floor(pagesToShow / 2), 1);
  let endPage = Math.min(page + Math.floor(pagesToShow / 2), totalPages);

  useEffect(() => {
    setPage(1);
  }, [view]);

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

  const paginate = () => {
    return (
      <div className="flex justify-center items-center gap-2 flex-wrap my-6">
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(1)}
          disabled={page === 1}
          className={PAGE_BTN}
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
          className={PAGE_BTN}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="default" disabled className="cursor-default text-slate-600">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
        {Array(endPage - startPage + 1)
          .fill("")
          .map((_, i) => (
            <Button
              key={i}
              variant={i + startPage === page ? "default" : "outline"}
              size="default"
              onClick={() => setPage(i + startPage)}
               className={i + startPage === page ? "border border-amber-300/40 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] text-slate-900 hover:brightness-105" : PAGE_BTN}
              >
              {i + startPage}
            </Button>
          ))}
        <Button variant="ghost" size="default" disabled className="cursor-default text-slate-600">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
          className={PAGE_BTN}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className={PAGE_BTN}
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const pageItems = cites.slice((page - 1) * perPage, page * perPage);

  return (
    <div ref={gridRef}>
      {paginate()}
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
            style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
          >
            {distributeToColumns(pageItems, columnCount).map((col, colIdx) => (
              <ul key={colIdx} className="space-y-3 sm:space-y-4">
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
      {paginate()}
    </div>
  );
};
