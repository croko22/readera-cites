import Toastify from "toastify-js";

import { FaCopy, FaTwitter } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
export const Cite = ({ cite }) => {
  const colors = [
    "list-group-item-secondary",
    "list-group-item-danger",
    "list-group-item-warning",
    "list-group-item-success",
    "list-group-item-primary",
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
    <li className={`list-group-item ${colors[cite.note_mark]} p-2 rounded`}>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-sm">Page: {cite.note_page}</small>

        <span>
          <OverlayTrigger overlay={<Tooltip>Copy this quote</Tooltip>}>
            <span>
              <FaCopy
                style={{ cursor: "pointer" }}
                onClick={() => copyCite(cite)}
              />
            </span>
          </OverlayTrigger>
          {"  "}
          <OverlayTrigger overlay={<Tooltip>Tweet this quote</Tooltip>}>
            <a
              href={`https://twitter.com/intent/tweet?text=${cite.note_body}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaTwitter />
            </a>
          </OverlayTrigger>
        </span>
      </div>
      <p className="mb-1">{cite.note_body}</p>
      {cite.note_extra && (
        <small>
          <b>Note:</b> {cite.note_extra}
        </small>
      )}
    </li>
  );
};
