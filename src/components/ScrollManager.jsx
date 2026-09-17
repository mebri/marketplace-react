import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const getScrollY = () => {
  return Math.max(
    window.scrollY || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
    document.getElementById("root")?.scrollTop || 0
  );
};

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

const getMaxScroll = () => {
  const root = document.getElementById("root");
  const rootMax = root ? root.scrollHeight - root.clientHeight : 0;
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

  // SAVE scroll position
  useEffect(() => {
    if (!key) return;
    const storageKey = "scroll:" + key;

    // Skip scroll events for the first 500ms to avoid mount-time
    // transient events (which fire y=0 and would overwrite the real value)
    const mountedAt = Date.now();
    const SAVE_DELAY_MS = 500;

    const save = () => {
      if (Date.now() - mountedAt < SAVE_DELAY_MS) return;
      const y = getScrollY();
      try {
        sessionStorage.setItem(storageKey, String(y));
      } catch (e) {}
    };

    window.addEventListener("scroll", save, { passive: true });
    document.addEventListener("scroll", save, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", save);
      document.removeEventListener("scroll", save, { capture: true });
    };
  }, [key]);

  // RESTORE scroll position
  useLayoutEffect(() => {
    if (!key) return;

    const storageKey = "scroll:" + key;
    let saved = null;
    try {
      saved = sessionStorage.getItem(storageKey);
    } catch (e) {}

    const isBack = saved !== null;
    console.log(
      "🧭 ScrollManager:",
      isBack ? "RESTORE" : "FRESH",
      "key=" + key,
      "saved=" + saved
    );

    if (!isBack) {
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
    let successes = 0;

    const tryRestore = () => {
      if (cancelled) return;
      attempts++;

      const maxScroll = getMaxScroll();
      if (maxScroll >= target) {
        scrollToY(target);
        if (Math.abs(getScrollY() - target) < 5) {
          successes++;
          if (successes >= 2) {
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
  }, [key]);

  return null;
}

export default ScrollManager;
