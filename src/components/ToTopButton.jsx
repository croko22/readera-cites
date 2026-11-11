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
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full border border-border bg-card text-foreground shadow-lg transition-colors duration-200 hover:border-ring/50 hover:bg-secondary"
        >
          <FaArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default ToTopButton;
