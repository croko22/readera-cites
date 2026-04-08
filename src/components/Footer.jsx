export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[linear-gradient(180deg,rgba(12,16,28,0.72),rgba(6,8,14,0.88))] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm leading-relaxed text-slate-300">
          Book notes visualizer for{" "}
          <a
            href="https://readera.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-300 transition-colors hover:text-amber-200"
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
