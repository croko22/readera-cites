import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { Button } from "./ui/button";

export const ToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowButton(window.pageYOffset > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  
  return (
    <>
      {showButton && (
        <Button
          onClick={scrollToTop}
          size="icon"
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full border border-white/10 bg-[rgba(26,26,36,0.65)] text-amber-400 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-amber-500/30 hover:text-amber-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:scale-110 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <FaArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default ToTopButton;