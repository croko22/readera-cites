import React, { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { useLocation, useParams } from "react-router-dom";
import { FaCopy, FaList, FaTh } from "react-icons/fa";
import { CitesList } from "../components/CitesList";
import { Search } from "../components/Search";

export const Book = () => {
  //* View
  const [view, setView] = useState("list");

  //*Book data extracting
  const { id } = useParams();
  const Book =
    useLocation().state ||
    JSON.parse(localStorage.getItem("Books")).find(
      (book) => book.data.doc_md5 === id
    );

  //*Book elements
  const title = Book.data.doc_title || Book.data.doc_file_name_title;
  let isMobile = window.innerWidth < 768;
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
      text: "All quotes copied!",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 3000,
      backgroundColor: "gray",
    }).showToast();
  };

  return (
    <div className="container mt-1">
      <div className="d-flex justify-content-between align-items-center">
        <h3>{isMobile ? title.slice(0, 25) + "..." : title}</h3>
        <button className="btn btn-dark m-1" onClick={() => copyCites()}>
          <div className="d-flex align-items-center gap-1">
            All <FaCopy />
          </div>
        </button>
      </div>
      <Search searchText={searchText} setSearchText={setSearchText} />
      {/* Filtering by color */}
      <div className="mt-1 d-flex justify-content-between align-items-center">
        <span className="h4">
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
        <button
          onClick={() => (view === "list" ? setView("grid") : setView("list"))}
          className="btn btn-light btn-sm"
        >
          {" "}
          {view === "list" ? <FaList /> : <FaTh />}{" "}
        </button>
      </div>
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
