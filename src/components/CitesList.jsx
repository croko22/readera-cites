import { useState } from "react";
import { Cite } from "./Cite";
import { Button } from "./ui/button";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export const CitesList = ({ cites, totalPages = 10, view = "list" }) => {
  const [page, setPage] = useState(1);
  const pagesToShow = totalPages > 10 ? 10 : totalPages;
  let startPage = Math.max(page - Math.floor(pagesToShow / 2), 1);
  let endPage = Math.min(page + Math.floor(pagesToShow / 2), totalPages - 1);

  const paginate = () => {
    return (
      <div className="flex justify-center items-center gap-2 flex-wrap my-6">
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 border-white/10 text-slate-300 transition-all duration-300"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
          className="hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 border-white/10 text-slate-300 transition-all duration-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="default" disabled className="cursor-default text-slate-600">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        {Array(endPage - startPage + 1)
          .fill("")
          .map((_, i) => (
            <Button
              key={i}
              variant={i + startPage === page ? "default" : "outline"}
              size="default"
              onClick={() => setPage(i + startPage)}
              className={i + startPage === page ? "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 border-white/10 text-slate-300 transition-all duration-300"}
            >
              {i + startPage}
            </Button>
          ))}
        <Button variant="ghost" size="default" disabled className="cursor-default text-slate-600">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => page < totalPages - 1 && setPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 border-white/10 text-slate-300 transition-all duration-300"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => setPage(totalPages - 1)}
          disabled={page === totalPages - 1}
          className="hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 border-white/10 text-slate-300 transition-all duration-300"
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
          {cites.slice((page - 1) * 10, page * 10).map((cite, index) => (
            <Cite key={index} cite={cite} />
          ))}
        </ul>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 mb-4">
          {cites.slice((page - 1) * 10, page * 10).map((cite, index) => (
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
