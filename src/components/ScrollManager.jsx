import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const isRestoring = useRef(false);

  // Disable browser's auto scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const key = "scroll:" + location.pathname + location.search;
    const savedY = parseInt(sessionStorage.getItem(key) || "0", 10);
    const isBack = navType === "POP";

    // === SAVE: continuously save scroll on this page ===
    let saveTimer = null;
    const saveScroll = () => {
      if (isRestoring.current) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        sessionStorage.setItem(key, String(window.scrollY));
      }, 80);
    };
    window.addEventListener("scroll", saveScroll, { passive: true });

    // === RESTORE: if going back, try hard to restore ===
    if (isBack && savedY > 0) {
      isRestoring.current = true;
      let attempts = 0;
      const maxAttempts = 25; // ~5 seconds
      const restore = () => {
        window.scrollTo(0, savedY);
        attempts++;
        const arrived = Math.abs(window.scrollY - savedY) < 5;
        if (!arrived && attempts < maxAttempts) {
          setTimeout(restore, 200);
        } else {
          isRestoring.current = false;
        }
      };
      setTimeout(restore, 60);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      // Save one last time before leaving
      sessionStorage.setItem(key, String(window.scrollY));
      window.removeEventListener("scroll", saveScroll);
      clearTimeout(saveTimer);
    };
  }, [location.pathname, location.search, navType]);

  return null;
}

export default ScrollManager;
