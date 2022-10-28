import React, {useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import {Search} from "./Search";
import { BookCard } from "./BookCard";

export const Library = () => {
  const [Books,setBooks] = useState(null)
  const [Favorites,setFavorites] = useState(false)
  const [SearchText,setSearchText] = useState('')
  //Cargar la informacion de los libros desde localstorage
  const navigate = useNavigate(); 
  useEffect(() => {
    const storedData = localStorage.getItem("Books");
     if (!storedData) navigate('/upload'); 
     else setBooks(JSON.parse(storedData).docs.filter((book)=> book.citations.length > 10))
  })

  const toggleFavs = () => {
    setFavorites(Favorites=>!Favorites) 
  }

  // const sortedBooks=Books.sort((a, b) => b.citations.length - a.citations.length))
  return (
    <div className="container mt-3">
      <Search handleSearchNote={setSearchText}/>
      <button className="mt-1 p-2 border-0" onClick={toggleFavs}>Filter by starred {Favorites ? <FaStar/> : <FaRegStar/>}</button>  
      <div className="list-group mt-3 mb-3">
        {
          //Filtering books by favorites and searchterm
          Favorites ? Books?.filter(book=> book.data.doc_favorites_time != 0)
            .filter(book=> book.data.doc_file_name_title.toLowerCase().includes(SearchText))
            .map((libro, index) => (<BookCard libro={libro} key={index} />)) 
          : Books?.filter(book=> book.data.doc_file_name_title.toLowerCase().includes(SearchText)).map((libro, index) => (<BookCard libro={libro} key={index} />))
        }
      </div>
    </div>
  );
};
