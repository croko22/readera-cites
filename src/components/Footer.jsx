export const Footer = () => {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[rgba(26,26,36,0.55)] backdrop-blur-lg">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm text-slate-300">
          Book notes visualizer for{" "}
          <a
            href="https://readera.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-400 hover:text-amber-300"
          >
            Readera
          </a>
          , by{" "}
          <a
            href="https://github.com/croko22"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-200 hover:text-amber-300"
          >
            Kevin
          </a>
          .
        </p>
      </div>
    </footer>
  );
};
