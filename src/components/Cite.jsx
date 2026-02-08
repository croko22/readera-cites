import Toastify from "toastify-js";

import { FaCopy, FaTwitter } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const Cite = ({ cite }) => {
  const colors = [
    "bg-white/5 border-slate-600",
    "bg-red-500/5 border-red-600",
    "bg-amber-500/5 border-amber-600",
    "bg-emerald-500/5 border-emerald-600",
    "bg-blue-500/5 border-blue-600",
  ];

  const textColors = [
    "text-slate-300",
    "text-red-300",
    "text-amber-300",
    "text-emerald-300",
    "text-blue-300",
  ];

  const copyCite = async (input) => {
    let text = "";
    if (typeof input === "string") {
      text = input;
    } else if (input && typeof input === "object") {
      const parts = [];
      parts.push(input.note_body || "");
      if (input.note_extra) parts.push(`Note: ${input.note_extra}`);
      if (input.note_page !== undefined && input.note_page !== null)
        parts.push(`(Page: ${input.note_page})`);
      text = parts.join("\n");
    }

    if (!text) {
      Toastify({
        text: "Nothing to copy",
        close: true,
        gravity: "top",
        position: "left",
        stopOnFocus: true,
        duration: 2000,
      }).showToast();
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      Toastify({
        text: "Quote copied to clipboard",
        close: true,
        gravity: "top",
        position: "left",
        stopOnFocus: true,
        duration: 3000,
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
          text: "Quote copied to clipboard (fallback)",
          close: true,
          gravity: "top",
          position: "left",
          stopOnFocus: true,
          duration: 3000,
        }).showToast();
      } catch (err2) {
        Toastify({
          text: "Failed to copy quote",
          close: true,
          gravity: "top",
          position: "left",
          stopOnFocus: true,
          duration: 3000,
          backgroundColor: "#cc0000",
        }).showToast();
      }
    }
  };

  return (
    <li className={`${colors[cite.note_mark]} p-5 rounded-xl list-none mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)] transition-all duration-300 border-l-4 ${cite.note_mark === 0 ? 'border-slate-500' : cite.note_mark === 1 ? 'border-red-500' : cite.note_mark === 2 ? 'border-amber-500' : cite.note_mark === 3 ? 'border-emerald-500' : 'border-blue-500'} hover:scale-[1.01] backdrop-blur-sm`}>
      <TooltipProvider>
        <div className="flex justify-between items-start mb-3">
          <small className={`text-sm font-bold ${textColors[cite.note_mark]} bg-white/5 px-3 py-1 rounded-full border border-white/10`}>📖 Page {cite.note_page}</small>

          <span className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="cursor-pointer text-slate-400 hover:text-amber-400 transition-all duration-200 hover:scale-110 p-1.5 hover:bg-white/5 rounded-lg"
                  onClick={() => copyCite(cite)}
                >
                  <FaCopy />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
                <p>Copy this quote</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${cite.note_body}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-amber-400 transition-all duration-200 hover:scale-110 p-1.5 hover:bg-white/5 rounded-lg"
                >
                  <FaTwitter />
                </a>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
                <p>Tweet this quote</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TooltipProvider>
      <p className="mb-3 text-slate-100 leading-relaxed text-base font-medium">{cite.note_body}</p>
      {cite.note_extra && (
        <small className="text-slate-300 bg-white/5 px-3 py-2 rounded-lg inline-block border border-white/10">
          <b className="text-amber-400">📝 Note:</b> {cite.note_extra}
        </small>
      )}
    </li>
  );
};
