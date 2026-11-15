import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "../config.js";

function readTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// the first theme is set by a small script in index.html (no flash before react loads)
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = readTheme() === "dark" ? "light" : "dark";
    // smooth color change for a moment only, so other animations stay fast
    root.classList.add("theme-transition");
    root.dataset.theme = next;
    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
    // stored as a plain string, like the original version
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      // the theme still works for this visit
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
