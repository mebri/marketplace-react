import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Module-level map so it survives navigation
const scrollPositions = {};

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const pathname = location.pathname;
  const restoreDone = useRef(false);

  // Save scroll position continuously on this page
  useEffect(() => {
    const key = pathname + location.search;

    // Reset the "restore done" flag whenever the page changes
    restoreDone.current = false;

    // On POP (back/forward), restore the position
    if (navType === "POP") {
      const saved = scrollPositions[key] || 0;

      // Retry loop because ads load asynchronously
      let attempts = 0;
      const tryRestore = () => {
        window.scrollTo(0, saved);
        attempts++;
        if (attempts < 8 && Math.abs(window.scrollY - saved) > 20) {
          setTimeout(tryRestore, 120);
        } else {
          restoreDone.current = true;
        }
      };
      setTimeout(tryRestore, 30);
    } else {
      // Fresh navigation → top
      window.scrollTo(0, 0);
      restoreDone.current = true;
    }

    // Save scroll position continuously (throttled)
    let lastSave = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastSave > 100) {
        lastSave = now;
        // Only save if we're not in the middle of restoring
        if (restoreDone.current) {
          scrollPositions[key] = window.scrollY;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Save one last time before leaving
    return () => {
      scrollPositions[key] = window.scrollY;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, location.search, navType]);

  return null;
}

export default ScrollManager;
