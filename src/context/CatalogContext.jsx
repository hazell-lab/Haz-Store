import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCatalog } from "../services/catalogService.js";

const CatalogContext = createContext(null);

// loads the products once and shares them with the whole app
// initialCatalog skips the request (used by tests)
export function CatalogProvider({ children, initialCatalog, fetcher }) {
  const [state, setState] = useState(() =>
    initialCatalog
      ? { status: "ready", ...initialCatalog, error: null }
      : { status: "loading", products: [], categories: [], error: null }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initialCatalog) {
      return undefined;
    }
    const controller = new AbortController();
    setState((current) => ({ ...current, status: "loading", error: null }));
    fetchCatalog({ signal: controller.signal, fetcher })
      .then((catalog) => setState({ status: "ready", ...catalog, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ status: "error", products: [], categories: [], error });
        }
      });
    return () => controller.abort();
  }, [attempt, initialCatalog, fetcher]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);
  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
