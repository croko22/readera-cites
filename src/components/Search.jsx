import React, { useState, useEffect, useRef, useCallback } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { Input } from "./ui/input";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from "../lib/booksStorage";

const SEARCH_MODES = [
  { key: "title", label: "Titles", title: "Titles: search book titles" },
  {
    key: "citations",
    label: "Citations",
    title: "Citations: search all citations",
  },
  {
    key: "insights",
    label: "Insights",
    title: "Insights: explore citation matches across books",
  },
];

export const Search = ({
  searchText,
  setSearchText,
  searchMode = "title",
  onSearchModeChange,
  label,
}) => {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const modeRefs = useRef([]);

  const loadHistory = useCallback(async () => {
    const entries = await getSearchHistory();
    setHistory(Array.isArray(entries) ? entries : []);
  }, []);

  // Load history on mount
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

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

  const handleModeKeyDown = useCallback((event, index) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const lastIndex = SEARCH_MODES.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }
    onSearchModeChange?.(SEARCH_MODES[nextIndex].key);
    modeRefs.current[nextIndex]?.focus();
  }, [onSearchModeChange]);

  const handleSelectHistory = useCallback((item) => {
    setSearchText(item);
    setShowHistory(false);
    void addSearchHistory(item);
  }, [setSearchText]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && searchText.trim()) {
      void addSearchHistory(searchText.trim()).then(loadHistory);
      setShowHistory(false);
    }
  }, [loadHistory, searchText]);

  const handleFocus = useCallback(() => {
    setShowHistory(true);
    void loadHistory();
  }, [loadHistory]);

  const handleRemoveHistoryItem = useCallback(async (item) => {
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    await clearSearchHistory();
    for (let i = updated.length - 1; i >= 0; i--) {
      await addSearchHistory(updated[i]);
    }
    await loadHistory();
  }, [history, loadHistory]);

  const onRemoveHistoryItem = useCallback((item) => {
    void handleRemoveHistoryItem(item);
  }, [handleRemoveHistoryItem]);

  const visibleHistory = showHistory && history.length > 0 && !searchText;

  const searchLabel = label ?? (
    searchMode === "citations"
      ? "Search all citations"
      : searchMode === "insights"
        ? "Explore citation matches across books"
        : "Search book titles"
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div className="panel grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border-border p-2.5 transition-[border-color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/40 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
        <MdSearch size="1.4em" className="ml-1 text-primary" />
        <Input
          ref={inputRef}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="h-11 min-w-0 border-0 bg-transparent px-0 text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          type="text"
          aria-label={searchLabel}
          placeholder={`${searchLabel}...`}
          value={searchText}
        />

        {/* Search mode toggle */}
        {onSearchModeChange && (
          <div
            role="radiogroup"
            aria-label="Search mode"
            className="col-span-3 row-start-2 grid min-w-0 grid-cols-3 items-center gap-2 rounded-lg border border-border bg-secondary/40 p-1 sm:col-span-1 sm:col-start-3 sm:row-start-1"
          >
            {SEARCH_MODES.map((mode, index) => {
              const active = searchMode === mode.key;
              return (
                <button
                  key={mode.key}
                  ref={(node) => { modeRefs.current[index] = node; }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={mode.title}
                  tabIndex={active ? 0 : -1}
                  onClick={() => onSearchModeChange(mode.key)}
                  onKeyDown={(event) => handleModeKeyDown(event, index)}
                  className={`min-h-11 min-w-0 rounded-md px-2 py-1 text-xs font-semibold [overflow-wrap:anywhere] transition-colors duration-200 active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 ${
                    active
                      ? "border border-primary/40 bg-primary/10 text-primary"
                      : "border border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
                  }`}
                  title={mode.title}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleClear}
          className="col-start-3 row-start-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:text-primary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-start-4"
          aria-label="Clear search"
        >
          <MdClose size="1.3em" />
        </button>
      </div>

      {/* Search history chips */}
      {visibleHistory && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-medium text-muted-foreground">
              Recent searches
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((item) => (
              <div
                key={item}
                className="group flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-secondary pr-1 text-sm text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80"
              >
                <button
                  type="button"
                  onClick={() => handleSelectHistory(item)}
                  className="min-h-11 min-w-0 rounded-full px-2.5 py-1 text-left [overflow-wrap:anywhere] transition-colors duration-200 hover:text-primary"
                  aria-label={`Use recent search: ${item}`}
                >
                  {item}
                </button>
                <button
                  type="button"
                   onClick={() => onRemoveHistoryItem(item)}
                   className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive active:bg-secondary group-hover:opacity-100"
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
