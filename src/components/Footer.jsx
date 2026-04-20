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
    <footer className="relative mt-auto border-t border-white/[0.07] bg-[linear-gradient(180deg,rgba(10,13,24,0.6),rgba(6,8,16,0.85))] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-8 sm:py-7">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 sm:items-start sm:pr-4">
          <Link
            to="/"
            className="group flex items-center gap-2 text-slate-100 transition-colors duration-300 hover:text-amber-300"
          >
            <FaBookOpen className="text-base text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-tight">ReadEra Cites</span>
          </Link>
          <p className="max-w-[220px] text-center text-xs leading-relaxed text-slate-500 sm:text-left">
            Book notes visualizer for{" "}
            <a
              href="https://readera.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-amber-300"
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
              className="text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-amber-300"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider (desktop) */}
        <span className="hidden h-8 w-px bg-white/[0.07] sm:block" aria-hidden="true" />

        {/* External links + version */}
        <div className="flex flex-col items-center gap-2.5 sm:items-end">
          <a
            href="https://github.com/croko22/readera-cites"
            target="_blank"
            rel="noopener noreferrer"
            className="motion-lift inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
          >
            <FaGithub className="text-sm" />
            <span>Source</span>
          </a>
          <span className="text-[10px] tracking-wide text-slate-600">
            v{APP_VERSION}
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <p className="py-3 text-center text-[11px] text-slate-600">
          Built by{" "}
          <a
            href="https://github.com/croko22"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 transition-colors hover:text-amber-300"
          >
            Kevin
          </a>
        </p>
      </div>
    </footer>
  );
};
