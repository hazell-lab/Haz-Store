import { FREE_SHIPPING_LIMIT, SHIPPING_FEE } from "../config.js";
import { getProductById } from "./catalog.js";
import { getSalePrice } from "./pricing.js";

// money math in cents, so totals never show float noise
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

// keep only valid cart items, without duplicates, and never more than the stock
export function cleanCart(savedCart, products) {
  if (!Array.isArray(savedCart)) {
    return [];
  }
  const cleaned = [];
  savedCart.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const product = getProductById(products, item.id);
    const quantity = Math.floor(Number(item.quantity));
    const alreadyAdded = cleaned.some((cartItem) => cartItem.id === item.id);
    if (!product || product.stock === 0 || !(quantity > 0) || alreadyAdded) {
      return;
    }
    cleaned.push({ id: product.id, quantity: Math.min(quantity, product.stock) });
  });
  return cleaned;
}

// keep only ids of products that exist, without duplicates
export function cleanIdList(savedIds, products) {
  if (!Array.isArray(savedIds)) {
    return [];
  }
  return savedIds.filter((id, index) => getProductById(products, id) !== undefined && savedIds.indexOf(id) === index);
}

// add to the cart, returns { cart, ok, reason }
export function addToCart(cart, product, quantity = 1) {
  if (!product || product.stock === 0) {
    return { cart, ok: false, reason: "out-of-stock" };
  }
  const item = cart.find((cartItem) => cartItem.id === product.id);
  const current = item ? item.quantity : 0;
  if (quantity < 1 || current + quantity > product.stock) {
    return { cart, ok: false, reason: "stock-limit" };
  }
  const next = item
    ? cart.map((cartItem) => (cartItem.id === product.id ? { ...cartItem, quantity: current + quantity } : cartItem))
    : [...cart, { id: product.id, quantity }];
  return { cart: next, ok: true };
}

export function removeFromCart(cart, id) {
  return cart.filter((item) => item.id !== id);
}

// set a quantity directly (below 1 removes the item), returns { cart, ok, reason, removed }
export function setCartQuantity(cart, product, quantity) {
  if (!product || !cart.some((item) => item.id === product.id)) {
    return { cart, ok: false, reason: "missing" };
  }
  if (quantity < 1) {
    return { cart: removeFromCart(cart, product.id), ok: true, removed: true };
  }
  if (quantity > product.stock) {
    return { cart, ok: false, reason: "stock-limit" };
  }
  return { cart: cart.map((item) => (item.id === product.id ? { ...item, quantity } : item)), ok: true };
}

// cart items joined with their product data
export function getCartLines(cart, products) {
  return cart
    .map((item) => {
      const product = getProductById(products, item.id);
      if (!product) {
        return null;
      }
      const unitPrice = getSalePrice(product);
      return { ...item, product, unitPrice, lineTotal: roundMoney(unitPrice * item.quantity) };
    })
    .filter(Boolean);
}

// subtotal, shipping and total (free shipping from RM300)
export function getCartTotals(lines) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = lines.length > 0 && subtotal < FREE_SHIPPING_LIMIT ? SHIPPING_FEE : 0;
  return {
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
    itemCount,
    isFreeShipping: lines.length > 0 && shipping === 0,
    remainingForFree: Math.max(0, roundMoney(FREE_SHIPPING_LIMIT - subtotal)),
    progress: Math.min(subtotal / FREE_SHIPPING_LIMIT, 1),
  };
}

// put a product first in the recently viewed list (no duplicates, capped)
export function pushRecent(list, id, limit) {
  return [id, ...list.filter((itemId) => itemId !== id)].slice(0, limit);
}

// add or remove an id
export function toggleId(list, id) {
  return list.includes(id) ? list.filter((itemId) => itemId !== id) : [...list, id];
}
