import { useEffect } from "react";

// fade in elements with the "reveal" class as they scroll into view
// deps: run again when new content appears (route change, data loaded)
export function useReveal(deps) {
  useEffect(() => {
    const items = [...document.querySelectorAll(".reveal:not(.is-visible)")];
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((item) => {
      // small stagger between siblings
      const siblings = [...item.parentElement.children].filter((child) => child.classList.contains("reveal"));
      item.style.setProperty("--delay", Math.min(siblings.indexOf(item), 5) * 80 + "ms");
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, deps);
}
