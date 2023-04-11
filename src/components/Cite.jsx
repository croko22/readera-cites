import React from "react";
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

  const copyCite = (text) => {
    navigator.clipboard.writeText(text);
    Toastify({
      text: "Quote copied to clipboard",
      close: true,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      duration: 3000,
    }).showToast();
  };

  return (
    <li className={`list-group-item ${colors[cite.note_mark]}`}>
      <div className="d-flex justify-content-between align-items-center">
        <h6>Page: {cite.note_page}</h6>
        <span>
          <OverlayTrigger overlay={<Tooltip>Copy this quote</Tooltip>}>
            <span>
              <FaCopy
                style={{ cursor: "pointer" }}
                onClick={() => copyCite(cite.note_body)}
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
