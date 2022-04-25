import React from 'react'
import { FaBookOpen,FaFileUpload } from "react-icons/fa";
export const Navbar = () => {
  return (
    <nav style={{position: 'sticky',top: '0',zIndex: 100}} className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand text-uppercase" href="/"><FaBookOpen className="text-white mb-1"/>  READERA BOOKS CITES</a>
          </div>
          <a className="btn btn-dark navbar-btn" href="/upload"><FaFileUpload className="text-white mb-1"/>UPLOAD BOOK DATA</a>
        </div>
    </nav>
  )
}
