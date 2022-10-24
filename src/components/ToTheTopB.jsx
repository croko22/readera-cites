import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./TopButton.css";

import React from 'react'

export const ToTheTopB = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
          setShowButton(true);
        } else {
          setShowButton(false);
        }
      });
    }, []);
  
    // This function will scroll the window to the top 
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // for smoothly scrolling
      });
    };
  
    return (
      <>
        {showButton && (
          <button onClick={scrollToTop} className="back-to-top">
            <FaArrowUp />
          </button>
        )}
      </>
    );
}