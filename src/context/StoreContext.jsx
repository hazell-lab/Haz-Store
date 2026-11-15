import { createContext, useContext, useEffect, useMemo } from "react";
import { RECENT_LIMIT, STORAGE_KEYS } from "../config.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { cleanCart, cleanIdList } from "../utils/cart.js";
import { useCatalog } from "./CatalogContext.jsx";

const StoreContext = createContext(null);

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// cart, wishlist and recently viewed, saved in local storage
export function StoreProvider({ children }) {
  const { status, products } = useCatalog();
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.cart, []);
  const [wishlist, setWishlist] = useLocalStorage(STORAGE_KEYS.wishlist, []);
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.recent, []);

  // once the products are known, drop saved items that are no longer valid
  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    const cleanedCart = cleanCart(cart, products);
    const cleanedWishlist = cleanIdList(wishlist, products);
    const cleanedRecent = cleanIdList(recent, products).slice(0, RECENT_LIMIT);
    if (!sameJson(cleanedCart, cart)) setCart(cleanedCart);
    if (!sameJson(cleanedWishlist, wishlist)) setWishlist(cleanedWishlist);
    if (!sameJson(cleanedRecent, recent)) setRecent(cleanedRecent);
  }, [status, products, cart, wishlist, recent, setCart, setWishlist, setRecent]);

  const value = useMemo(
    () => ({
      cart: Array.isArray(cart) ? cart : [],
      wishlist: Array.isArray(wishlist) ? wishlist : [],
      recent: Array.isArray(recent) ? recent : [],
      setCart,
      setWishlist,
      setRecent,
    }),
    [cart, wishlist, recent, setCart, setWishlist, setRecent]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
