import React from "react";
import { Accordion, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
export const BookCard = ({ libro, bookKey }) => {
  return (
    <Accordion.Item eventKey={bookKey}>
      <Accordion.Header>
        <h5 className="mb-1">
          {libro.data.doc_file_name_title}{" "}
          {libro.data.doc_favorites_time !== 0 && (
            <span className="btn btn-warning">Fav</span>
          )}
        </h5>
        <small>{libro.citations.length} quotes</small>
      </Accordion.Header>

      <Accordion.Body>
        <p className="mb-1">
          <b>Author:</b> {libro.data.doc_authors}
        </p>
        <ProgressBar
          now={Math.round(JSON.parse(libro.data.doc_position).ratio * 100)}
          label={`Progress: ${Math.round(
            JSON.parse(libro.data.doc_position).ratio * 100
          )}%`}
        />
        <Link
          to="/book"
          state={libro}
          className="mt-2 list-group-item list-group-item-action flex-column align-items-start"
        >
          Go to book
        </Link>
      </Accordion.Body>
    </Accordion.Item>
  );
};
