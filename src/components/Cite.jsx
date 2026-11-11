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

const ACTION_CLASS = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-primary active:bg-secondary/80";

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
        "min-w-0 list-none rounded-xl border [overflow-wrap:anywhere]",
        isGrid ? "p-3.5" : "p-5",
        c.border,
      ].join(" ")}
      style={isGrid ? { animationDelay: `${index * 30}ms` } : undefined}
    >
      <TooltipProvider>
        <div className={`flex flex-wrap items-start justify-between gap-2 ${isGrid ? "mb-2" : "mb-3"}`}>
          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            <small
              className={[
                "font-bold",
                c.text,
                "rounded-full border border-border bg-secondary",
                isGrid ? "text-[11px] px-2 py-0.5" : "text-sm px-3 py-1",
              ].join(" ")}
            >
              Page {cite.note_page}
            </small>
            {getCitationTimestamp(cite) ? (
              <small className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                {formatRelativeTime(getCitationTimestamp(cite))}
              </small>
            ) : null}
          </span>

          <span className="flex shrink-0 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={ACTION_CLASS}
                  onClick={() => copyCite(cite)}
                  aria-label="Copy citation"
                >
                  <FaCopy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover text-popover-foreground">
                <p>Copy this quote</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${cite.note_body}`}
                  target="_blank"
                  rel="noreferrer"
                  className={ACTION_CLASS}
                  aria-label="Share citation on X"
                >
                  <FaTwitter className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent className="border-border bg-popover text-popover-foreground">
                <p>Tweet this quote</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TooltipProvider>
      <p
        className={[
          "text-foreground leading-relaxed font-medium",
          isGrid ? "mb-2 text-[13px]" : "mb-3 text-base",
        ].join(" ")}
      >
        {cite.note_body}
      </p>
      {cite.note_extra && (
        <small
          className={[
            "inline-block max-w-full rounded-lg border border-border bg-secondary text-secondary-foreground",
            isGrid ? "text-[11px] px-2.5 py-1.5" : "px-3 py-2",
          ].join(" ")}
        >
          <b className="text-primary">Note:</b> {cite.note_extra}
        </small>
      )}
    </li>
  );
};
