import Toastify from "toastify-js";

import { FaCopy, FaTwitter } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  CITATION_COLORS,
  getCitationColorKey,
  getCitationTimestamp,
  formatRelativeTime,
} from "../lib/readeraVocab";

export const Cite = ({ cite, variant = "list", index = 0 }) => {
  const c = CITATION_COLORS[getCitationColorKey(cite)] ?? CITATION_COLORS[0];
  const isGrid = variant === "grid";

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
    } catch {
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
      } catch {
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
    <li
      className={[
        c.bg,
        isGrid ? "card-appear card-grid" : "motion-lift",
        "list-none rounded-xl border-l-4 backdrop-blur-sm",
        isGrid ? "p-3.5" : "p-5",
        c.border,
      ].join(" ")}
      style={isGrid ? { animationDelay: `${index * 30}ms` } : undefined}
    >
      <TooltipProvider>
        <div className={isGrid ? "mb-2 flex items-start justify-between gap-2" : "mb-3 flex items-start justify-between"}>
          <span className="flex items-center gap-1.5 flex-wrap">
            <small
              className={[
                "font-bold",
                c.text,
                "bg-white/[0.07] rounded-full border border-white/14",
                isGrid ? "text-[11px] px-2 py-0.5" : "text-sm px-3 py-1",
              ].join(" ")}
            >
              📖 Page {cite.note_page}
            </small>
            {getCitationTimestamp(cite) ? (
              <small className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {formatRelativeTime(getCitationTimestamp(cite))}
              </small>
            ) : null}
          </span>

          <span className={isGrid ? "flex gap-1" : "flex gap-3"}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={[
                    "cursor-pointer rounded-lg text-slate-400 transition-colors duration-300 hover:bg-white/8 hover:text-amber-300",
                    isGrid ? "p-1" : "p-1.5",
                  ].join(" ")}
                  onClick={() => copyCite(cite)}
                  aria-label="Copy citation"
                >
                  <FaCopy className={isGrid ? "text-xs" : ""} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-white/10 text-slate-200">
                <p>Copy this quote</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${cite.note_body}`}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "rounded-lg text-slate-400 transition-colors duration-300 hover:bg-white/8 hover:text-amber-300",
                    isGrid ? "p-1" : "p-1.5",
                  ].join(" ")}
                  aria-label="Share citation on X"
                >
                  <FaTwitter className={isGrid ? "text-xs" : ""} />
                </a>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-white/10 text-slate-200">
                <p>Tweet this quote</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TooltipProvider>
      <p
        className={[
          "text-slate-100 leading-relaxed font-medium",
          isGrid ? "mb-2 text-[13px]" : "mb-3 text-base",
        ].join(" ")}
      >
        {cite.note_body}
      </p>
      {cite.note_extra && (
        <small
          className={[
            "text-slate-300 bg-white/[0.06] rounded-lg inline-block border border-white/14",
            isGrid ? "text-[11px] px-2.5 py-1.5" : "px-3 py-2",
          ].join(" ")}
        >
          <b className="text-amber-300">Note:</b> {cite.note_extra}
        </small>
      )}
    </li>
  );
};
