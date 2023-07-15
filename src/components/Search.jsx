import React from "react";
import { MdSearch, MdClose } from "react-icons/md";
export const Search = ({ searchText, setSearchText }) => {
  return (
    <div className="input-group rounded">
      <span className="input-group-text border-0">
        <MdSearch size="1.3em" />
      </span>
      <input
        onChange={(e) => setSearchText(e.target.value)}
        className="form-control rounded"
        type="text"
        placeholder="Type to search quotes..."
        value={searchText}
      />
      <span className="input-group-text border-0">
        <MdClose size="1.3em" onClick={() => setSearchText("")} />
      </span>
    </div>
  );
};
