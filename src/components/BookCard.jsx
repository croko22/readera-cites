import React from "react";
import {
  Accordion,
  Card,
  ProgressBar,
  useAccordionButton,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";

export const BookCard = ({ libro, bookKey }) => {
  return (
    <Card>
      <Card.Header as="div">
        <div className="d-flex w-100 justify-content-between">
          <Link
            to={`/book/${libro.data.doc_md5}`}
            state={libro}
            style={{ textDecoration: "none", color: "black" }}
          >
            <h5 className="mb-1">
              {libro.data.doc_file_name_title}{" "}
              {libro.data.doc_favorites_time !== 0 && (
                <span className="btn btn-warning">Fav</span>
              )}
            </h5>
          </Link>
          <span>
            <small>{libro.citations.length} quotes</small>
            <RiArrowDropDownLine
              className="h2"
              onClick={useAccordionButton(bookKey)}
            ></RiArrowDropDownLine>
          </span>
        </div>
      </Card.Header>

      <Accordion.Collapse eventKey={bookKey}>
        <Card.Body>
          <p className="mb-1 d-flex justify-content-between">
            <span>
              <b>Author:</b> {libro.data.doc_authors}
            </span>
            <span>
              Rating:{" "}
              {libro.data.doc_rating > 0
                ? "⭐".repeat(libro.data.doc_rating)
                : "None"}
            </span>
            <span></span>
          </p>
          <ProgressBar
            now={Math.round(JSON.parse(libro.data.doc_position).ratio * 100)}
            label={`Progress: ${Math.round(
              JSON.parse(libro.data.doc_position).ratio * 100
            )}%`}
          />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};
