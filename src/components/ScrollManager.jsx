import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll positions saved in memory (keyed by pathname+search)
const positions = {};

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const path = location.pathname + location.search;
  const prevPathRef = useRef(path);

  // Disable browser's automatic scroll restore (it fights with ours)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Continuously save the scroll position for the current path
  useEffect(() => {
    const save = () => {
      positions[path] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", save);
    };
  }, [path]);

  // Handle path changes
  useEffect(() => {
    const prevPath = prevPathRef.current;

    // Save the previous path's final scroll position
    if (prevPath !== path) {
      positions[prevPath] = positions[prevPath] ?? window.scrollY;
    }
    prevPathRef.current = path;

    // Only restore on back/forward navigation
    const isBack = navType === "POP";
    const target = isBack ? positions[path] || 0 : 0;

    // Disable smooth scrolling during restoration
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    // No restore needed → jump to top
    if (target === 0) {
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prevBehavior;
      return;
    }

    // RETRY loop: keep trying until the page is tall enough
    let stopped = false;
    let attempts = 0;
    const maxAttempts = 50; // ~5 seconds
    let timer = null;

    const restore = () => {
      if (stopped) return;
      attempts++;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target) {
        window.scrollTo(0, target);
        if (Math.abs(window.scrollY - target) < 5) {
          stopped = true;
          html.style.scrollBehavior = prevBehavior;
          return;
        }
      }

      if (attempts < maxAttempts) {
        timer = setTimeout(restore, 100);
      } else {
        html.style.scrollBehavior = prevBehavior;
      }
    };

    timer = setTimeout(restore, 50);

    // MutationObserver: fires whenever the DOM changes (ads loading, images rendering)
    const observer = new MutationObserver(() => {
      if (stopped) return;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= target) {
        window.scrollTo(0, target);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup after 5 seconds
    const cleanupTimer = setTimeout(() => {
      stopped = true;
      observer.disconnect();
      clearTimeout(timer);
      html.style.scrollBehavior = prevBehavior;
    }, 5000);

    return () => {
      stopped = true;
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
      html.style.scrollBehavior = prevBehavior;
    };
  }, [path, navType]);

  return null;
}

export default ScrollManager;
