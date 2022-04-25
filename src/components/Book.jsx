import React from 'react'
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CitesList } from './CitesList';
import { Search } from './Search';

export const Book = () => {
  //Scroll to the top 
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //Cites extracting
  const Book = useLocation().state;
  const [Cites,setCites] = useState(Book.citations)

  //Filtering and searching 
  const [searchText, setSearchText] = useState("")
  const filterColors=(n)=>{
    if(n===7)  setCites(Book.citations)
    else setCites(Book.citations.filter(cite=>cite.note_mark===n))
  }

  return (
    <div className="container">
      <h3 className="justify-content-center">Book: {Book.data.doc_title}</h3>
      <Search handleSearchNote={setSearchText}/>

      <div className="filter-section mt-1">
        <span className="h4">Filter by color: </span>
        <span onClick={() => filterColors(7)} className="btn btn-info m-1">All {Book.citations.length}</span>
        <span onClick={() => filterColors(0)} className="btn btn-secondary m-1">{Book.citations.filter(cite=>cite.note_mark===0).length}</span>
        <span onClick={() => filterColors(1)} className="btn btn-danger m-1">{Book.citations.filter(cite=>cite.note_mark===1).length}</span>
        <span onClick={() => filterColors(2)} className="btn btn-warning m-1">{Book.citations.filter(cite=>cite.note_mark===2).length}</span>
        <span onClick={() => filterColors(3)} className="btn btn-success m-1">{Book.citations.filter(cite=>cite.note_mark===3).length}</span>
        <span onClick={() => filterColors(4)} className="btn btn-primary m-1">{Book.citations.filter(cite=>cite.note_mark===4).length}</span>
      </div>

      <CitesList cites={Cites.filter((cite)=> cite.note_body.toLowerCase().includes(searchText))} />

    </div>
  )
}
