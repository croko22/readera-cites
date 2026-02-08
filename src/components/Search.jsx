import React from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { Input } from "./ui/input";

export const Search = ({ searchText, setSearchText }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 bg-[rgba(26,26,36,0.6)] backdrop-blur-lg shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 mb-6 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
      <MdSearch size="1.5em" className="text-amber-500 ml-1" />
      <Input
        onChange={(e) => setSearchText(e.target.value)}
        className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-slate-500 bg-transparent text-slate-100"
        type="text"
        placeholder="Search your quotes and notes..."
        value={searchText}
      />
      <button 
        onClick={() => setSearchText("")}
        className="text-slate-500 hover:text-amber-400 cursor-pointer transition-colors duration-200 hover:scale-110 mr-1 focus:outline-none"
      >
        <MdClose size="1.3em" />
      </button>
    </div>
  );
};
