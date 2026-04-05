import React, { useState, useEffect, useRef, useCallback } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { Input } from "./ui/input";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from "../lib/booksStorage";

export const Search = ({
  searchText,
  setSearchText,
  searchMode = "title",
  onSearchModeChange,
}) => {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  // Close history on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, [setSearchText]);

  const handleClear = useCallback(() => {
    setSearchText("");
    inputRef.current?.focus();
  }, [setSearchText]);

  const handleSelectHistory = useCallback((item) => {
    setSearchText(item);
    setShowHistory(false);
    addSearchHistory(item);
  }, [setSearchText]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && searchText.trim()) {
      addSearchHistory(searchText.trim()).then(() => {
        getSearchHistory().then(setHistory);
      });
      setShowHistory(false);
    }
  }, [searchText]);

  const handleFocus = useCallback(() => {
    setShowHistory(true);
    getSearchHistory().then(setHistory);
  }, []);

  const handleRemoveHistoryItem = useCallback((e, item) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    clearSearchHistory().then(() => {
      const readd = async () => {
        for (let i = updated.length - 1; i >= 0; i--) {
          await addSearchHistory(updated[i]);
        }
      };
      readd();
    });
  }, [history]);

  const visibleHistory =
    showHistory && history.length > 0 && !searchText;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-3 rounded-lg p-2 bg-[rgba(26,26,36,0.6)] backdrop-blur-lg shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 mb-0 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <MdSearch size="1.5em" className="text-amber-500 ml-1" />
        <Input
          ref={inputRef}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-500 bg-transparent text-slate-100"
          type="text"
          placeholder={
            searchMode === "citations"
              ? "Search inside all citations..."
              : "Search your quotes and notes..."
          }
          value={searchText}
        />

        {/* Search mode toggle */}
        {onSearchModeChange && (
          <button
            onClick={() =>
              onSearchModeChange(
                searchMode === "title" ? "citations" : "title"
              )
            }
            className="text-xs font-semibold px-2 py-1 rounded-md border transition-all duration-200 cursor-pointer whitespace-nowrap
              border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
            title={
              searchMode === "title"
                ? "Switch to citation search"
                : "Switch to title search"
            }
          >
            {searchMode === "title" ? "Titles" : "Citations"}
          </button>
        )}

        <button
          onClick={handleClear}
          className="text-slate-500 hover:text-amber-400 cursor-pointer transition-colors duration-200 hover:scale-110 mr-1 focus:outline-none"
        >
          <MdClose size="1.3em" />
        </button>
      </div>

      {/* Search history chips */}
      {visibleHistory && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1 p-2 rounded-lg bg-[rgba(26,26,36,0.95)] backdrop-blur-lg border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs text-slate-500 font-medium">
              Recent searches
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((item) => (
              <button
                key={item}
                onClick={() => handleSelectHistory(item)}
                className="group flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-200 cursor-pointer"
              >
                <span>{item}</span>
                <span
                  onClick={(e) => handleRemoveHistoryItem(e, item)}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-0.5"
                >
                  <MdClose size="0.85em" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
