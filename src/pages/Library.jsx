import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRedo,
  FaRegStar,
  FaStar,
  FaSortAmountDown,
  FaTimes,
} from "react-icons/fa";
import { Search } from "../components/Search";
import { BookCard } from "../components/BookCard";
import { Accordion } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

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

  const sortAlphabetically = () => {
    setIsorting((isSorting) => !isSorting);
    if (!isSorting)
      setBooks(
        [...Books].sort((a, b) =>
          a.data.doc_file_name_title.localeCompare(b.data.doc_file_name_title)
        )
      );
    else restoreChanges();
  };

  const restoreChanges = () => {
    setBooks(storedData);
    setFavorites(false);
    setIsorting(false);
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-8">
      <Search searchText={searchText} setSearchText={setSearchText} />

      <TooltipProvider>
        <div className="my-4 flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            size="default" 
            onClick={toggleFavs}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            {Favorites ? <FaStar className="text-amber-500" /> : <FaRegStar />} Favorites
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={sortByNofQuotes}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            <FaSortAmountDown /> By Quotes
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={sortAlphabetically}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            <FaSortAmountDown /> Alphabetically
          </Button>

          {Favorites || isSorting ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  onClick={restoreChanges}
                  className="gap-2 font-semibold border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                >
                  <FaTimes /> Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
                <p>Reset filters <FaRedo className="inline" /></p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </TooltipProvider>

      <Accordion type="single" collapsible className="space-y-2">
        {Books?.filter((book) =>
          book.data.doc_file_name_title
            .toLowerCase()
            .includes(searchText.toLowerCase())
        ).map((libro, index) => (
          <BookCard libro={libro} bookKey={index} key={index} />
        ))}
      </Accordion>
    </div>
  );
};
