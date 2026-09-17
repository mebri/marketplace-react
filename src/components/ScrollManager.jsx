import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Get the actual scrolling element's Y position
const getScrollY = () => {
  return Math.max(
    window.scrollY || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
    document.getElementById("root")?.scrollTop || 0
  );
};

// Force scroll on ALL possible scroll containers
const scrollToY = (y) => {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  window.scrollTo(0, y);
  html.scrollTop = y;
  document.body.scrollTop = y;
  const root = document.getElementById("root");
  if (root) root.scrollTop = y;

  html.style.scrollBehavior = prev;
};

// Max scrollable distance across ALL possible containers
const getMaxScroll = () => {
  const root = document.getElementById("root");
  const rootMax = root
    ? root.scrollHeight - root.clientHeight
    : 0;
  const windowMax =
    document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(rootMax, windowMax, 0);
};

function ScrollManager() {
  const location = useLocation();
  const key = location.key;

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // SAVE scroll position — listens on window AND document (capture)
  useEffect(() => {
    if (!key) return;

    const storageKey = "scroll:" + key;

    const save = () => {
      const y = getScrollY();
      try {
        sessionStorage.setItem(storageKey, String(y));
      } catch (e) {}
    };

    // Listen on window
    window.addEventListener("scroll", save, { passive: true });
    // Also listen on any element that scrolls (document with capture)
    document.addEventListener("scroll", save, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", save);
      document.removeEventListener("scroll", save, { capture: true });
    };
  }, [key]);

  // RESTORE — when history entry changes
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
      currentY: getScrollY(),
    });

    // First visit → top
    if (saved === null) {
      scrollToY(0);
      return;
    }

    const target = parseInt(saved, 10) || 0;

    if (target === 0) {
      scrollToY(0);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer = null;
    let consecutiveSuccesses = 0;

    const tryRestore = () => {
      if (cancelled) return;
      attempts++;

      const maxScroll = getMaxScroll();

      if (maxScroll >= target) {
        scrollToY(target);

        if (Math.abs(getScrollY() - target) < 5) {
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
      }
    };

    tryRestore();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [key, location.pathname, location.search]);

  return null;
}

export default ScrollManager;
