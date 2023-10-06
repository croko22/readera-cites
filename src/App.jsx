import { Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { Library } from "./pages/Library";
import { Book } from "./pages/Book";
import { Upload } from "./pages/Upload";
import { Footer } from "./components/Footer";
import { ToTheTopB } from "./components/ToTheTopB";

function App() {
  return (
    <>
      <ToTheTopB />
      <Header />
      <div className="min-vh-100">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/book/:id" element={<Book />} />
          <Route exact path="/upload" element={<Upload />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
