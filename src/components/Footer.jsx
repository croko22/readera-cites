export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[rgba(18,18,26,0.72)] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm leading-relaxed text-slate-300">
          Book notes visualizer for{" "}
          <a
            href="https://readera.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-400 transition-colors hover:text-amber-300"
          >
            Readera
          </a>
          , by{" "}
          <a
            href="https://github.com/croko22"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-200 transition-colors hover:text-amber-300"
          >
            Kevin
          </a>
          .
        </p>
      </div>
    </footer>
  );
};
