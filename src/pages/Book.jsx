import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { useLocation, useParams } from "react-router-dom";
import { FaCopy, FaList, FaTh } from "react-icons/fa";
import { CitesList } from "../components/CitesList";
import { Search } from "../components/Search";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

export const Book = () => {
  const [view, setView] = useState("list");

  const { id } = useParams();
  const Book =
    useLocation().state ||
    JSON.parse(localStorage.getItem("Books")).find(
      (book) => book.data.doc_md5 === id
    );

  const title = Book.data.doc_title || Book.data.doc_file_name_title;
  let isMobile = window.innerWidth < 768;
  const [Cites, setCites] = useState(Book.citations);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchText, setSearchText] = useState("");
  const filterColors = (n) => {
    n === 7
      ? setCites(Book.citations)
      : setCites(Book.citations.filter((cite) => cite.note_mark === n));
  };

  const copyCites = async () => {
    const visible = Cites.filter((cite) =>
      cite.note_body.toLowerCase().includes(searchText.toLowerCase())
    );

    if (!visible.length) {
      Toastify({
        text: "No quotes to copy",
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        duration: 2500,
        backgroundColor: "gray",
      }).showToast();
      return;
    }

    const lines = visible.map((c, idx) => {
      const parts = [];

      parts.push(`${idx + 1}. ${c.note_body}`);

      if (c.note_extra) parts.push(`   Note: ${c.note_extra}`);

      if (c.note_page !== undefined && c.note_page !== null)
        parts.push(`   (Page: ${c.note_page})`);
      return parts.join("\n");
    });

    const text = lines.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      Toastify({
        text: `Copied ${visible.length} quote${
          visible.length > 1 ? "s" : ""
        } to clipboard`,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        duration: 3000,
        backgroundColor: "gray",
      }).showToast();
    } catch (err) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        Toastify({
          text: `Copied ${visible.length} quote${
            visible.length > 1 ? "s" : ""
          } (fallback)`,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          duration: 3000,
          backgroundColor: "gray",
        }).showToast();
      } catch (err2) {
        Toastify({
          text: "Failed to copy to clipboard",
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          duration: 3000,
          backgroundColor: "#cc0000",
        }).showToast();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl font-bold truncate text-slate-100">{isMobile ? title.slice(0, 25) + "..." : title}</h3>
        <Button variant="default" className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300" onClick={() => copyCites()}>
          Copy All <FaCopy />
        </Button>
      </div>
      <Search searchText={searchText} setSearchText={setSearchText} />
      
      {/* Filtering by color */}
      <TooltipProvider>
        <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
          <span className="flex gap-2 flex-wrap">
            <Button onClick={() => filterColors(7)} variant="secondary" size="default" className="bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 shadow-lg transition-all duration-300 font-semibold">
              All {Book.citations.length}
            </Button>
            <Button onClick={() => filterColors(0)} variant="secondary" size="default" className="bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 text-slate-300 shadow-lg transition-all duration-300">
              {Book.citations.filter((cite) => cite.note_mark === 0).length}
            </Button>
            <Button onClick={() => filterColors(1)} variant="secondary" size="default" className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 shadow-lg transition-all duration-300">
              {Book.citations.filter((cite) => cite.note_mark === 1).length}
            </Button>
            <Button onClick={() => filterColors(2)} size="default" className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 shadow-lg transition-all duration-300">
              {Book.citations.filter((cite) => cite.note_mark === 2).length}
            </Button>
            <Button onClick={() => filterColors(3)} size="default" className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 shadow-lg transition-all duration-300">
              {Book.citations.filter((cite) => cite.note_mark === 3).length}
            </Button>
            <Button onClick={() => filterColors(4)} size="default" className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 shadow-lg transition-all duration-300">
              {Book.citations.filter((cite) => cite.note_mark === 4).length}
            </Button>
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() =>
                  view === "list" ? setView("grid") : setView("list")
                }
                variant="outline"
                size="default"
                className="shadow-lg border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
              >
                {view === "list" ? <FaList /> : <FaTh />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
              <p>{`Change to ${view === "list" ? "grid" : "list"} view`}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      <CitesList
        cites={Cites.filter((cite) =>
          cite.note_body.toLowerCase().includes(searchText)
        )}
        totalPages={Math.ceil(Cites.length / 10 + 1)}
        view={view}
      />
    </div>
  );
};
