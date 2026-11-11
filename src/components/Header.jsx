import { FaBookOpen, FaFileUpload } from "react-icons/fa";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link to="/" className="flex items-center gap-2.5 text-foreground transition-colors duration-200 hover:text-primary sm:gap-3">
            <FaBookOpen className="text-xl text-primary sm:text-2xl" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              <span className="hidden sm:inline">ReadEra - Book notes</span>
              <span className="sm:hidden">ReadEra</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/upload"
              className="motion-lift inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 sm:px-5 sm:py-2.5 sm:text-base"
            >
              <FaFileUpload />
              <span className="hidden sm:inline">Upload backup</span>
              <span className="sm:hidden">Upload</span>
            </Link>
            <Link
              to="/settings"
              className="motion-lift flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80"
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
