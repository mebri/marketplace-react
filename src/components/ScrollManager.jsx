import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const path = location.pathname + location.search;

  // Disable browser's native scroll restoration (it fights with ours)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Save scroll position for current path — ONLY on real scroll events
  // (not on mount, because mount happens after DOM swap)
  useEffect(() => {
    const key = "scroll:" + path;
    let lastY = window.scrollY;

    const save = () => {
      const y = window.scrollY;
      // Only save if user actually moved (avoids overwriting with 0
      // during DOM swaps or layout changes)
      if (Math.abs(y - lastY) > 1) {
        try {
          sessionStorage.setItem(key, String(y));
        } catch (e) {
          // sessionStorage may be blocked in private mode
        }
        lastY = y;
      }
    };

    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
    };
  }, [path]);

  // Restore on back/forward (POP) navigation
  useLayoutEffect(() => {
    if (navType !== "POP") {
      // Fresh navigation → go to top
      window.scrollTo(0, 0);
      return;
    }

    const key = "scroll:" + path;
    let target = 0;
    try {
      target = parseInt(sessionStorage.getItem(key) || "0", 10);
    } catch (e) {}

    console.log("🔙 ScrollManager POP:", { path, target });

    if (!target || target === 0) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 120; // ~12 seconds
    let observer = null;
    let timer = null;
    let successCount = 0;

    const doScroll = () => {
      if (cancelled) return;
      window.scrollTo(0, target);
    };

    const tryRestore = () => {
      if (cancelled) return;
      attempts++;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target) {
        doScroll();
        // If we're close enough, count as success
        if (Math.abs(window.scrollY - target) < 5) {
          successCount++;
          // Two consecutive successes = stable
          if (successCount >= 2) {
            cancelled = true;
            if (observer) observer.disconnect();
            if (timer) clearTimeout(timer);
            return;
          }
        }
      }

      if (attempts < maxAttempts) {
        timer = setTimeout(tryRestore, 100);
      }
    };

    // Watch DOM for changes (ads loading asynchronously)
    if (typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(() => {
        if (cancelled) return;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= target) {
          doScroll();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start immediately
    tryRestore();

    // Hard cleanup after 15 seconds
    const cleanupTimer = setTimeout(() => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
    }, 15000);

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
      clearTimeout(cleanupTimer);
    };
  }, [path, navType]);

  return null;
}

export default ScrollManager;
