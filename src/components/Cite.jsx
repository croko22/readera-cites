import Toastify from "toastify-js";

import { FaCopy, FaTwitter } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function formatRelativeTime(timestampMs) {
  if (!timestampMs) return null;
  const now = Date.now();
  const diff = now - timestampMs;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat(navigator.language || "en", {
    numeric: "auto",
  });

  if (years > 0) return rtf.format(-years, "year");
  if (months > 0) return rtf.format(-months, "month");
  if (weeks > 0) return rtf.format(-weeks, "week");
  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}

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
        style: { "--toast-duration": "2s" },
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
        style: { "--toast-duration": "3s" },
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
          style: { "--toast-duration": "3s" },
        }).showToast();
      } catch (err2) {
        Toastify({
          text: "Failed to copy quote",
          close: true,
          gravity: "top",
          position: "left",
          stopOnFocus: true,
          duration: 3000,
          style: { "--toast-duration": "3s" },
          backgroundColor: "#cc0000",
        }).showToast();
      }
    }
  };

  return (
    <li className={`${colors[cite.note_mark]} motion-lift mb-4 list-none rounded-xl border-l-4 p-5 backdrop-blur-sm ${cite.note_mark === 0 ? 'border-slate-500' : cite.note_mark === 1 ? 'border-red-500' : cite.note_mark === 2 ? 'border-amber-400' : cite.note_mark === 3 ? 'border-emerald-500' : 'border-blue-500'}`}>
      <TooltipProvider>
        <div className="mb-3 flex items-start justify-between">
          <span className="flex items-center gap-2 flex-wrap">
            <small className={`text-sm font-bold ${textColors[cite.note_mark]} bg-white/[0.07] px-3 py-1 rounded-full border border-white/14`}>
              📖 Page {cite.note_page}
            </small>
            {cite.note_timestamp ? (
              <small className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {formatRelativeTime(cite.note_timestamp)}
              </small>
            ) : null}
          </span>

          <span className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/8 hover:text-amber-300"
                  onClick={() => copyCite(cite)}
                  aria-label="Copy citation"
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
                  className="rounded-lg p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/8 hover:text-amber-300"
                  aria-label="Share citation on X"
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
        <small className="text-slate-300 bg-white/[0.06] px-3 py-2 rounded-lg inline-block border border-white/14">
          <b className="text-amber-300">Note:</b> {cite.note_extra}
        </small>
      )}
    </li>
  );
};
