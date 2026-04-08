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

  const handleRemoveHistoryItem = useCallback((item) => {
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
      <div className="panel flex items-center gap-3 rounded-xl border-white/15 p-2.5 transition-[border-color,box-shadow] duration-300 focus-within:border-amber-400/55 focus-within:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_12px_34px_rgba(2,6,23,0.46)]">
        <MdSearch size="1.4em" className="ml-1 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
        <Input
          ref={inputRef}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="h-10 flex-1 border-0 bg-transparent px-0 text-[0.98rem] text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            className="motion-lift whitespace-nowrap rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400 transition-all duration-200"
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
          className="mr-1 rounded-md p-1 text-slate-500 transition-colors duration-200 hover:text-amber-400 focus:outline-none"
          aria-label="Clear search"
        >
          <MdClose size="1.3em" />
        </button>
      </div>

      {/* Search history chips */}
      {visibleHistory && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-xl border border-white/15 bg-[linear-gradient(170deg,rgba(22,26,38,0.96),rgba(11,13,20,0.94))] p-2.5 shadow-[0_22px_48px_rgba(1,4,14,0.56)] backdrop-blur-lg">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs text-slate-500 font-medium">
              Recent searches
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((item) => (
              <div
                key={item}
                className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/5 pr-1 text-sm text-slate-300 transition-colors duration-200 hover:border-amber-500/30 hover:bg-amber-500/10"
              >
                <button
                  type="button"
                  onClick={() => handleSelectHistory(item)}
                  className="rounded-full px-2.5 py-1 text-left transition-colors duration-200 hover:text-amber-400"
                  aria-label={`Use recent search: ${item}`}
                >
                  {item}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveHistoryItem(item)}
                  className="ml-0.5 rounded-full p-1 text-slate-600 transition-colors hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Remove recent search: ${item}`}
                >
                  <MdClose size="0.85em" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
