import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const positions = {};

function ScrollManager() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const key = pathname + search;

  // Disable browser auto-restore
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Helper to scroll instantly (bypasses CSS smooth scroll)
    const jumpTo = (y) => {
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      // Restore previous smooth behavior on next frame
      requestAnimationFrame(() => {
        html.style.scrollBehavior = prev;
      });
    };

    // Save scroll position on scroll
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
        jumpTo(target);
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const done = maxScroll >= target;

        if (!done && tries < 40) {
          setTimeout(restore, 100);
        }
      };

      setTimeout(restore, 30);
    } else {
      // NEW PAGE — jump to top instantly
      jumpTo(0);
    }

    return () => {
      positions[key] = window.scrollY;
      window.removeEventListener("scroll", save);
    };
  }, [key, navType]);

  return null;
}

export default ScrollManager;
