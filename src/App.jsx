import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import { Navbar } from './components/Navbar';
import {Library} from './components/Library';
import {Book} from './components/Book';
import {Footer} from './components/Footer';
import {Upload} from './components/Upload';

import { ToTheTopB } from './components/ToTheTopB';
//APP DE CITAS DE READERA
function App() {
  return(
    <>
    <ToTheTopB/>
    <Navbar/>
    {/* //Routing basico de la lista de libros y una pag para cada libro  */}
    <div className="container d-flex flex-column min-vh-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Library/>}/>
          <Route path="/book" element={<Book/>}/>
          <Route path="/upload" element={<Upload/>}/>
        </Routes>
      </BrowserRouter>
    </div>
    <Footer/>
    </>
  )
}

export default App;

