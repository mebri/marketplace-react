import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const pathRef = useRef(location.pathname + location.search);

  // 1. Disable browser auto-restore
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. Save scroll continuously as user scrolls
  useEffect(() => {
    const save = () => {
      const key = pathRef.current;
      sessionStorage.setItem("scroll:" + key, String(window.scrollY));
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  // 3. When pathname changes, either restore (if POP) or reset (if PUSH)
  useEffect(() => {
    const newKey = location.pathname + location.search;
    const oldKey = pathRef.current;

    // If pathname changed, save old, then prepare new
    if (newKey !== oldKey) {
      // Save the old page's position before switching
      sessionStorage.setItem("scroll:" + oldKey, String(window.scrollY));
      pathRef.current = newKey;
    }

    // Try to restore for the new page
    const saved = sessionStorage.getItem("scroll:" + newKey);
    if (saved !== null) {
      const target = parseInt(saved, 10);
      let tries = 0;
      const restore = () => {
        tries++;
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, target);
        html.style.scrollBehavior = prev;

        const maxScroll = html.scrollHeight - window.innerHeight;
        if ((maxScroll < target || Math.abs(window.scrollY - target) > 5) && tries < 40) {
          setTimeout(restore, 100);
        }
      };
      setTimeout(restore, 30);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  return null;
}

export default ScrollManager;
