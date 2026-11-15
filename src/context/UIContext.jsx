import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const UIContext = createContext(null);

// which side panel is open: "cart", "filters" or null
export function UIProvider({ children }) {
  const [panel, setPanel] = useState(null);

  const openPanel = useCallback((name) => setPanel(name), []);
  const closePanel = useCallback(() => setPanel(null), []);

  // stop the page scrolling behind an open panel
  useEffect(() => {
    document.body.classList.toggle("no-scroll", panel !== null);
    return () => document.body.classList.remove("no-scroll");
  }, [panel]);

  const value = useMemo(() => ({ panel, openPanel, closePanel }), [panel, openPanel, closePanel]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used inside UIProvider");
  }
  return context;
}
