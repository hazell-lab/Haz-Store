import { useEffect, useState } from "react";
import { PAGE_SIZES } from "../config.js";

function matches(query) {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
}

export function useMediaQuery(query) {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }
    const list = window.matchMedia(query);
    const update = () => setIsMatch(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return isMatch;
}

// shop page size that keeps full rows: 8 on phones, 9 on tablets, 12 on desktop
export function usePageSize() {
  const small = useMediaQuery("(max-width: 768px)");
  const medium = useMediaQuery("(max-width: 1200px)");
  if (small) return PAGE_SIZES.small;
  if (medium) return PAGE_SIZES.medium;
  return PAGE_SIZES.large;
}
