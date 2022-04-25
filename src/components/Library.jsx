import React from "react";
import { Link } from "react-router-dom";

//Interfaz inicial que muestre como funciona la app 

//COSAS QUE FALTAN
// - Boton copiar todas las citas
// - Metodos de ordenacion pa libros (nCitas, recientes, favs, etc)
// - Multidioma en/es

export const Library = () => {
  const Books = JSON.parse(localStorage.getItem("Books")).docs

  //CREO PARA QUE ESTO FUNCIONE YA NO TENDRE QUE USAR EL INDEX, CREO QUE USARE EL MD5
  
  // const sortedBooks=Books.sort((a, b) => b.citations.length - a.citations.length))
  return (
    <>
      <div className="list-group mt-3 mb-3">
        {Books.filter((book)=> book.citations.length > 10).map((libro, index) => (
                  <Link to="/book" state={libro} key={index} className="list-group-item list-group-item-action flex-column align-items-start">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{libro.data.doc_file_name_title} {libro.data.doc_favorites_time!==0 ? <span className="btn btn-warning">Fav</span> : <span></span>}</h5>
                        <small>{libro.citations.length} citas</small>
                      </div>
                  </Link>
        ))}
      </div>
    </>
  );
};
