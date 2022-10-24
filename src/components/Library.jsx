import React, {useEffect,useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import {MdSearch} from 'react-icons/md'

export const Library = () => {
  const [Books,setBooks] = useState(null)
  const [Favorites,setFavorites] = useState(false)
  const [Search,setSearch] = useState('')
  //Cargar la informacion de los libros desde localstorage
  const navigate = useNavigate(); 
  useEffect(() => {
    const storedData = localStorage.getItem("Books");
     if (!storedData) navigate('/upload');
     else setBooks(JSON.parse(storedData).docs)
  })

  const toggleFavs = () => {
    setFavorites(Favorites=>!Favorites)
  }

  // const sortedBooks=Books.sort((a, b) => b.citations.length - a.citations.length))
  return (
    <div className="container mt-3">
      <div className="input-group rounded">
        <input onChange={(e)=>handleSearchNote(e.target.value)} className="form-control rounded" type="text" placeholder="Type to search quotes..." />
        <span className="input-group-text border-0">
        <MdSearch className="search-icons" size="1.3em"/>
        </span>
        <button className="p-2 border-0" onClick={toggleFavs}>{Favorites ? <FaStar/> : <FaRegStar/>}</button>  
      </div>
      <div className="list-group mt-3 mb-3">
        {Books?.filter((book)=> book.citations.length > 10).map((libro, index) => (
          <Link to="/book" state={libro} key={index} className="list-group-item list-group-item-action flex-column align-items-start">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{libro.data.doc_file_name_title} {libro.data.doc_favorites_time!==0 && <span className="btn btn-warning">Fav</span>}</h5>
                <small>{libro.citations.length} quotes</small>
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
