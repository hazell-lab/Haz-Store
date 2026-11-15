import { useCallback, useRef } from "react";
import { useCart } from "../hooks/useCart.js";
import { useWishlist } from "../hooks/useWishlist.js";
import { ProductCard } from "./ProductCard.jsx";
import { EmptyState } from "./States.jsx";

// a grid of product cards, or an empty state when the list is empty
// animateFrom: index of the first card that animates in (-1 for none)
export function ProductGrid({ products, className = "", variant, emptyIcon = "search", emptyMessage, animateFrom = -1, eagerCount = 0, label }) {
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  // stable callbacks so memoized cards only re-render when their own data changes
  const latest = useRef({ add, toggle });
  latest.current = { add, toggle };
  const handleAdd = useCallback((id, quantity) => latest.current.add(id, quantity), []);
  const handleToggle = useCallback((id) => latest.current.toggle(id), []);

  if (products.length === 0) {
    return (
      <div className={"product-grid " + className}>
        <EmptyState icon={emptyIcon}>{emptyMessage}</EmptyState>
      </div>
    );
  }

  return (
    <div className={"product-grid " + className} aria-label={label}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          inWishlist={ids.includes(product.id)}
          onAdd={handleAdd}
          onToggleWishlist={handleToggle}
          index={Math.max(0, index - Math.max(animateFrom, 0))}
          animate={animateFrom >= 0 && index >= animateFrom}
          eager={index < eagerCount}
        />
      ))}
    </div>
  );
}
