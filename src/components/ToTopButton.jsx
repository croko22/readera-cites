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
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full border border-amber-300/30 bg-[linear-gradient(145deg,rgba(245,158,11,0.26),rgba(18,24,38,0.88))] text-amber-200 shadow-[0_14px_36px_rgba(2,6,23,0.58)] backdrop-blur-lg transition-all duration-300 hover:border-amber-300/50 hover:text-amber-100 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-110 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <FaArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default ToTopButton;
