import { useState } from "react";
import { Cite } from "./Cite";
import { Button } from "./ui/button";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export const CitesList = ({ cites, view = "list" }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(Math.ceil(cites.length / perPage), 1);
  const pagesToShow = totalPages > 10 ? 10 : totalPages;
  let startPage = Math.max(page - Math.floor(pagesToShow / 2), 1);
  let endPage = Math.min(page + Math.floor(pagesToShow / 2), totalPages);

  const paginate = () => {
    return (
      <div className="flex justify-center items-center gap-2 flex-wrap my-6">
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="motion-lift border-white/10 text-slate-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
          className="motion-lift border-white/10 text-slate-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
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
               className={i + startPage === page ? "bg-amber-500 text-slate-900 hover:bg-amber-600" : "motion-lift border-white/10 text-slate-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"}
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
          className="motion-lift border-white/10 text-slate-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="motion-lift border-white/10 text-slate-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div>
      {paginate()}
      {view === "list" ? (
        <ul className="space-y-2 mt-2 mb-2">
          {cites.slice((page - 1) * perPage, page * perPage).map((cite, index) => (
            <Cite key={index} cite={cite} />
          ))}
        </ul>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 mb-4">
          {cites.slice((page - 1) * perPage, page * perPage).map((cite, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-4"
            >
              <Cite cite={cite} />
            </div>
          ))}
        </div>
      )}
      {paginate()}
    </div>
  );
};
