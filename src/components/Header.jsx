import { FaBookOpen, FaFileUpload } from "react-icons/fa";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,10,18,0.94),rgba(8,10,18,0.8))] backdrop-blur-xl shadow-[0_16px_34px_rgba(0,0,0,0.4)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link to="/" className="group relative flex items-center gap-2.5 text-slate-100 transition-colors duration-300 hover:text-amber-300 sm:gap-3">
            <span className="absolute -inset-x-3 -inset-y-2 rounded-xl bg-amber-400/0 transition-colors duration-300 group-hover:bg-amber-400/8" aria-hidden="true" />
            <FaBookOpen className="relative text-xl text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.45)] transition-transform duration-300 group-hover:scale-110 sm:text-2xl" />
            <span className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
              <span className="hidden sm:inline">ReadEra - Book notes</span>
              <span className="sm:hidden">ReadEra</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/upload"
              className="motion-lift relative flex items-center gap-2 overflow-hidden rounded-lg border border-amber-300/35 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] px-3 py-2 text-sm font-semibold text-slate-950 transition-all duration-300 hover:border-amber-300/60 hover:shadow-[0_14px_30px_rgba(245,158,11,0.35)] sm:px-5 sm:py-2.5 sm:text-base"
            >
              <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.33),transparent)] transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
              <FaFileUpload />
              <span className="hidden sm:inline">Upload backup</span>
              <span className="sm:hidden">Upload</span>
            </Link>
            <Link
              to="/settings"
              className="motion-lift flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] text-slate-300 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/12 hover:text-amber-300 sm:h-10 sm:w-10"
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
