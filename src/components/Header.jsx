import { FaBookOpen, FaFileUpload } from "react-icons/fa";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,10,15,0.86)] backdrop-blur-xl shadow-[0_8px_26px_rgba(0,0,0,0.28)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link to="/" className="group flex items-center gap-2.5 text-slate-100 transition-colors duration-200 hover:text-amber-400 sm:gap-3">
            <FaBookOpen className="text-xl text-amber-500 transition-transform duration-200 group-hover:scale-110 sm:text-2xl" />
            <span className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
              <span className="hidden sm:inline">ReadEra - Book notes</span>
              <span className="sm:hidden">ReadEra</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/upload"
              className="motion-lift flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition-all duration-200 hover:bg-amber-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] sm:px-5 sm:py-2.5 sm:text-base"
            >
              <FaFileUpload />
              <span className="hidden sm:inline">Upload backup</span>
              <span className="sm:hidden">Upload</span>
            </Link>
            <Link
              to="/settings"
              className="motion-lift flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 sm:h-10 sm:w-10"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
