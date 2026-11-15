import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);
const MAX_TOASTS = 2;

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  // action is optional: { label, onClick }
  const showToast = useCallback(
    (message, action) => {
      const id = nextId++;
      // keep at most two toasts on screen
      setToasts((list) => [...list, { id, message, action }].slice(-MAX_TOASTS));
      timers.current.set(id, setTimeout(() => dismiss(id), action ? 4000 : 2500));
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ showToast, dismiss, toasts }), [showToast, dismiss, toasts]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
