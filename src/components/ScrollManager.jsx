import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Global storage for scroll positions (survives navigation)
const positions = {};

function ScrollManager() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const key = pathname + search;

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    console.log("🧭 NAV:", navType, "| PATH:", key, "| SAVED:", positions[key]);

    // Track scroll position on this page
    const save = () => {
      positions[key] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });

    if (navType === "POP" && positions[key] !== undefined) {
      // RESTORE
      const target = positions[key];
      let tries = 0;

      const restore = () => {
        tries++;
        window.scrollTo(0, target);
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const done =
          maxScroll >= target && Math.abs(window.scrollY - target) < 5;

        console.log(
          `  ↻ try ${tries}: target=${target} current=${window.scrollY} max=${maxScroll} done=${done}`
        );

        if (!done && tries < 30) {
          setTimeout(restore, 100);
        }
      };

      setTimeout(restore, 50);
    } else {
      // NEW PAGE — go to top
      window.scrollTo(0, 0);
    }

    return () => {
      positions[key] = window.scrollY;
      window.removeEventListener("scroll", save);
    };
  }, [key, navType]);

  return null;
}

export default ScrollManager;
