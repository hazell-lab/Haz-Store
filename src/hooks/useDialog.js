import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// focus handling for drawers and sheets:
// moves focus in when opened, keeps tab inside, closes on escape, gives focus back on close
export function useDialog(open, onClose) {
  const ref = useRef(null);
  const opener = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    opener.current = document.activeElement;
    const node = ref.current;
    const first = node && (node.querySelector("[data-autofocus]") || node.querySelector(FOCUSABLE));
    if (first) {
      first.focus({ preventScroll: true });
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !node) {
        return;
      }
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((item) => item.getClientRects().length > 0);
      if (items.length === 0) {
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (!node.contains(document.activeElement)) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      // focus goes back to the button that opened the panel (if it is still on the page)
      const back = opener.current;
      if (back && typeof back.focus === "function" && document.contains(back)) {
        back.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return ref;
}
