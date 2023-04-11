import React from "react";
import { FaBookOpen, FaFileUpload } from "react-icons/fa";
export const Navbar = () => {
  return (
    <nav
      style={{ position: "sticky", top: "0", zIndex: 100 }}
      className="navbar navbar-dark bg-dark px-5"
    >
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="/">
            <FaBookOpen className="text-white mb-1" /> ReadEra book notes &
            quotes
          </a>
        </div>
        <a className="btn btn-dark navbar-btn" href="/upload">
          <FaFileUpload className="text-white mb-1" />
          UPLOAD BOOK DATA
        </a>
      </div>
    </nav>
  );
};
