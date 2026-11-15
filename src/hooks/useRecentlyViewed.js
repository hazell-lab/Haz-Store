import { useCallback, useMemo } from "react";
import { RECENT_LIMIT } from "../config.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { getProductById } from "../utils/catalog.js";
import { pushRecent } from "../utils/cart.js";

// newest first, no duplicates, at most six products
export function useRecentlyViewed() {
  const { products } = useCatalog();
  const { recent, setRecent } = useStore();

  const items = useMemo(
    () => recent.map((id) => getProductById(products, id)).filter(Boolean),
    [recent, products]
  );

  const addViewed = useCallback(
    (id) => {
      const next = pushRecent(recent, id, RECENT_LIMIT);
      // skip the update when nothing changed (avoids extra renders)
      if (next.join() !== recent.join()) {
        setRecent(next);
      }
    },
    [recent, setRecent]
  );

  const clear = useCallback(() => setRecent([]), [setRecent]);

  return { items, addViewed, clear };
}
