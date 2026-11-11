import { FaBookOpen, FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

const APP_VERSION = __APP_VERSION__;

const NAV_LINKS = [
  { label: "Library", to: "/" },
  { label: "Upload", to: "/upload" },
  { label: "Settings", to: "/settings" },
];

export const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-border bg-card/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-8 sm:py-7">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 sm:items-start sm:pr-4">
          <Link
            to="/"
            className="group flex items-center gap-2 text-foreground transition-colors duration-300 hover:text-primary"
          >
            <FaBookOpen className="text-base text-primary" />
            <span className="text-sm font-semibold tracking-tight">ReadEra Cites</span>
          </Link>
          <p className="max-w-[220px] text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
            Book notes visualizer for{" "}
            <a
              href="https://readera.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              ReadEra
            </a>
          </p>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-5 sm:ml-auto" aria-label="Footer navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider (desktop) */}
        <span className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        {/* External links + version */}
        <div className="flex flex-col items-center gap-2.5 sm:items-end">
          <a
            href="https://github.com/croko22/readera-cites"
            target="_blank"
            rel="noopener noreferrer"
            className="motion-lift inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors duration-200 hover:border-ring/50 hover:bg-secondary/80"
          >
            <FaGithub className="text-sm" />
            <span>Source</span>
          </a>
          <span className="text-[10px] tracking-wide text-muted-foreground/70">
            v{APP_VERSION}
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <p className="py-3 text-center text-[11px] text-muted-foreground/70">
          Built by{" "}
          <a
            href="https://github.com/croko22"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Kevin
          </a>
        </p>
      </div>
    </footer>
  );
};
