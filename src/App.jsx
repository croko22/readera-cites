import { Routes, Route, useLocation } from "react-router-dom";

import { Header } from "./components/Header";
import { Library } from "./pages/Library";
import { Book } from "./pages/Book";
import { Upload } from "./pages/Upload";
import { Settings } from "./pages/Settings";
import { Footer } from "./components/Footer";
import { ToTopButton } from "./components/ToTopButton";

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F]">
      <ToTopButton />
      <Header />
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          <Routes location={location}>
            <Route path="/" element={<Library />} />
            <Route path="/book/:id" element={<Book />} />
            <Route exact path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
