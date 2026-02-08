import { FaBookOpen, FaFileUpload } from "react-icons/fa";

export const Header = () => {
  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2 sm:gap-3 text-slate-100 hover:text-amber-400 transition-colors duration-200 group">
            <FaBookOpen className="text-xl sm:text-2xl text-amber-500 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold text-base sm:text-lg text-slate-100">
              <span className="hidden sm:inline">ReadEra - Book notes</span>
              <span className="sm:hidden">ReadEra</span>
            </span>
          </a>
          
          <a 
            href="/upload" 
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] font-medium text-sm sm:text-base"
          >
            <FaFileUpload />
            <span className="hidden sm:inline">Upload backup</span>
            <span className="sm:hidden">Upload</span>
          </a>
        </div>
      </div>
    </nav>
  );
};
