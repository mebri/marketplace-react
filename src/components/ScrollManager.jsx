import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const key = location.key;

  // Disable browser's auto restore
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // SAVE: continuously save scroll position for this exact history entry
  useEffect(() => {
    if (!key) return;

    const storageKey = "scroll:" + key;

    const save = () => {
      try {
        sessionStorage.setItem(storageKey, String(window.scrollY));
      } catch (e) {}
    };

    window.addEventListener("scroll", save, { passive: true });

    return () => {
      // Save final position before unmount
      save();
      window.removeEventListener("scroll", save);
    };
  }, [key]);

  // RESTORE: runs when the history entry changes
  useLayoutEffect(() => {
    if (!key) return;

    const storageKey = "scroll:" + key;
    let saved = null;

    try {
      saved = sessionStorage.getItem(storageKey);
    } catch (e) {}

    console.log("🧭 ScrollManager:", {
      key,
      path: location.pathname + location.search,
      saved,
    });

    // First time visiting this history entry → go to top
    if (saved === null) {
      window.scrollTo(0, 0);
      return;
    }

    const target = parseInt(saved, 10) || 0;

    if (target === 0) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer = null;
    let consecutiveSuccesses = 0;

    const jumpTo = () => {
      if (cancelled) return;
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, target);
      html.style.scrollBehavior = prev;
    };

    const tryRestore = () => {
      if (cancelled) return;
      attempts++;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target) {
        jumpTo();

        if (Math.abs(window.scrollY - target) < 5) {
          consecutiveSuccesses++;
          if (consecutiveSuccesses >= 2) {
            cancelled = true;
            if (timer) clearTimeout(timer);
            console.log("✅ Scroll restored to", target);
            return;
          }
        }
      }

      if (attempts < 150) {
        timer = setTimeout(tryRestore, 100);
      } else {
        console.warn("⛔ Scroll restore timed out. Max scroll:", maxScroll, "Target:", target);
      }
    };

    // Start immediately
    tryRestore();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [key, location.pathname, location.search]);

  return null;
}

export default ScrollManager;
