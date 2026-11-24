import { FaBookOpen, FaFileUpload } from "react-icons/fa";
import { Clock3, Library as LibraryIcon, Settings } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Library", icon: LibraryIcon, end: true },
  { to: "/timeline", label: "Recent", icon: Clock3 },
];

const navLinkClass = ({ isActive }) =>
  `motion-lift inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  }`;

export const Header = () => {
  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* One row on desktop; brand/actions plus a dedicated navigation row on mobile. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
          <Link
            to="/"
            className="order-1 flex min-h-11 items-center gap-2.5 rounded-lg text-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
          >
            <FaBookOpen className="text-xl text-primary sm:text-2xl" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              <span className="hidden sm:inline">ReadEra - Book notes</span>
              <span className="sm:hidden">ReadEra</span>
            </span>
          </Link>

          <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            <Link
              to="/upload"
              className="motion-lift inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FaFileUpload aria-hidden="true" />
              <span className="hidden sm:inline">Upload backup</span>
              <span className="sm:hidden">Upload</span>
            </Link>
            <Link
              to="/settings"
              aria-label="Settings"
              className="motion-lift flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="order-3 flex w-full items-center gap-1 border-t border-border pt-2 sm:order-2 sm:ml-3 sm:w-auto sm:border-0 sm:pt-0">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
