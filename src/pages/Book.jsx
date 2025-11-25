import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { useLocation, useParams } from "react-router-dom";
import { FaCopy, FaList, FaTh } from "react-icons/fa";
import { CitesList } from "../components/CitesList";
import { Search } from "../components/Search";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export const Book = () => {
  const [view, setView] = useState("list");

  const { id } = useParams();
  const Book =
    useLocation().state ||
    JSON.parse(localStorage.getItem("Books")).find(
      (book) => book.data.doc_md5 === id
    );

  const title = Book.data.doc_title || Book.data.doc_file_name_title;
  let isMobile = window.innerWidth < 768;
  const [Cites, setCites] = useState(Book.citations);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchText, setSearchText] = useState("");
  const filterColors = (n) => {
    n === 7
      ? setCites(Book.citations)
      : setCites(Book.citations.filter((cite) => cite.note_mark === n));
  };

  const copyCites = async () => {
    const visible = Cites.filter((cite) =>
      cite.note_body.toLowerCase().includes(searchText.toLowerCase())
    );

    if (!visible.length) {
      Toastify({
        text: "No quotes to copy",
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        duration: 2500,
        backgroundColor: "gray",
      }).showToast();
      return;
    }

    const lines = visible.map((c, idx) => {
      const parts = [];

      parts.push(`${idx + 1}. ${c.note_body}`);

      if (c.note_extra) parts.push(`   Note: ${c.note_extra}`);

      if (c.note_page !== undefined && c.note_page !== null)
        parts.push(`   (Page: ${c.note_page})`);
      return parts.join("\n");
    });

    const text = lines.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      Toastify({
        text: `Copied ${visible.length} quote${
          visible.length > 1 ? "s" : ""
        } to clipboard`,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        duration: 3000,
        backgroundColor: "gray",
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
          text: `Copied ${visible.length} quote${
            visible.length > 1 ? "s" : ""
          } (fallback)`,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          duration: 3000,
          backgroundColor: "gray",
        }).showToast();
      } catch (err2) {
        Toastify({
          text: "Failed to copy to clipboard",
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          duration: 3000,
          backgroundColor: "#cc0000",
        }).showToast();
      }
    }
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
        <OverlayTrigger
          overlay={
            <Tooltip>
              {`Change to ${view === "list" ? "grid" : "list"} view`}
            </Tooltip>
          }
        >
          <button
            onClick={() =>
              view === "list" ? setView("grid") : setView("list")
            }
            className="btn btn-light btn-sm"
          >
            <span>{view === "list" ? <FaList /> : <FaTh />} </span>
          </button>
        </OverlayTrigger>
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
