import React, { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { useLocation } from "react-router-dom";
import { FaCopy } from "react-icons/fa";
import { CitesList } from "./CitesList";
import { Search } from "./Search";

export const Book = () => {
  //*Book data extracting
  const Book = useLocation().state;
  const [Cites, setCites] = useState(Book.citations);
  //*Scroll to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //*Filtering and searching
  const [searchText, setSearchText] = useState("");
  const filterColors = (n) => {
    n === 7
      ? setCites(Book.citations)
      : setCites(Book.citations.filter((cite) => cite.note_mark === n));
  };

  const copyCites = () => {
    let text = "";
    for (const a in Cites) text += `- ${Cites[a].note_body}\n`;
    navigator.clipboard.writeText(text);
    Toastify({
      text: "All quotes copied to clipboard",
      close: true,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      duration: 3000,
    }).showToast();
  };

  return (
    <div className="container">
      <h3>Book: {Book.data.doc_title}</h3>
      <Search handleSearchNote={setSearchText} />
      {/* Filtering by color */}
      <div className="mt-1 d-flex justify-content-between">
        <span className="h4">
          Filter by color:
          <span onClick={() => filterColors(7)} className="btn btn-info m-1">
            All {Book.citations.length}
          </span>
          <span
            onClick={() => filterColors(0)}
            className="btn btn-secondary m-1"
          >
            {Book.citations.filter((cite) => cite.note_mark === 0).length}
          </span>
          <span onClick={() => filterColors(1)} className="btn btn-danger m-1">
            {Book.citations.filter((cite) => cite.note_mark === 1).length}
          </span>
          <span onClick={() => filterColors(2)} className="btn btn-warning m-1">
            {Book.citations.filter((cite) => cite.note_mark === 2).length}
          </span>
          <span onClick={() => filterColors(3)} className="btn btn-success m-1">
            {Book.citations.filter((cite) => cite.note_mark === 3).length}
          </span>
          <span onClick={() => filterColors(4)} className="btn btn-primary m-1">
            {Book.citations.filter((cite) => cite.note_mark === 4).length}
          </span>
        </span>
        {/* Export quotes button */}
        <div className="btn btn-dark m-1" onClick={() => copyCites()}>
          <FaCopy /> Copy all quotes to the clipboard
        </div>
      </div>
      <CitesList
        cites={Cites.filter((cite) =>
          cite.note_body.toLowerCase().includes(searchText)
        )}
      />
    </div>
  );
};
