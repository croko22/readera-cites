import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRedo, FaRegStar, FaStar, FaSortAmountDown } from "react-icons/fa";
import { Search } from "../components/Search";
import { BookCard } from "../components/BookCard";
import { Accordion } from "react-bootstrap";

export const Library = () => {
  const storedData = JSON.parse(localStorage.getItem("Books"));
  const [Books, setBooks] = useState(storedData);
  const [Favorites, setFavorites] = useState(false);
  const [isSorting, setIsorting] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    if (!storedData) navigate("/upload");
  }, []);

  const toggleFavs = () => {
    setFavorites((Favorites) => !Favorites);
    if (!Favorites)
      setBooks(Books.filter((book) => book.data.doc_favorites_time != 0));
    else restoreChanges();
  };

  const sortByNofQuotes = () => {
    setIsorting((isSorting) => !isSorting);
    if (!isSorting)
      setBooks(Books.sort((a, b) => b.citations.length - a.citations.length));
    else restoreChanges();
  };

  const restoreChanges = () => {
    setBooks(storedData);
    setFavorites(false);
    setIsorting(false);
  };

  return (
    <div className="container mt-3">
      <Search searchText={searchText} setSearchText={setSearchText} />

      <div className="my-2">
        <button className="btn btn-outline-dark btn-sm" onClick={toggleFavs}>
          <div className="d-flex align-items-center gap-1">
            Filter by starred {Favorites ? <FaStar /> : <FaRegStar />}
          </div>
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={sortByNofQuotes}
        >
          <div className="d-flex align-items-center gap-1">
            Sort by number of quotes <FaSortAmountDown />
          </div>
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={restoreChanges}
        >
          <div className="d-flex align-items-center gap-1">
            Restore changes <FaRedo />
          </div>
        </button>
      </div>

      <Accordion defaultActiveKey="0">
        {Books?.filter((book) =>
          book.data.doc_file_name_title.toLowerCase().includes(searchText)
        ).map((libro, index) => (
          <BookCard libro={libro} bookKey={index} key={index} />
        ))}
      </Accordion>
    </div>
  );
};
