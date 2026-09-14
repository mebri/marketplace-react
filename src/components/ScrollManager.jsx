
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    const key = `scroll-${location.key}`;

    if (navType === "POP") {
      // Back or forward navigation → restore saved position
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const targetY = parseInt(saved, 10);

        // Retry a few times because ads load asynchronously from Firebase
        let attempts = 0;
        const tryRestore = () => {
          window.scrollTo(0, targetY);
          attempts++;
          if (attempts < 6 && Math.abs(window.scrollY - targetY) > 15) {
            setTimeout(tryRestore, 150);
          }
        };

        // Small delay so the page can render first
        setTimeout(tryRestore, 50);
      }
    } else {
      // Fresh navigation → scroll to top
      window.scrollTo(0, 0);
    }

    // Save scroll position before leaving this page
    return () => {
      sessionStorage.setItem(key, window.scrollY.toString());
    };
  }, [location.key, navType]);

  return null;
}

export default ScrollManager;
