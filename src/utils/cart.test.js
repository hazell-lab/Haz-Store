import { describe, expect, it } from "vitest";
import { catalog } from "../test/renderApp.jsx";
import {
  addToCart,
  cleanCart,
  cleanIdList,
  getCartLines,
  getCartTotals,
  pushRecent,
  removeFromCart,
  setCartQuantity,
  toggleId,
} from "./cart.js";

const { products } = catalog;
const byId = (id) => products.find((p) => p.id === id);
const headphones = byId(1); // RM199.20 after 20% off, 15 in stock
const laptop = byId(5); // RM3,909.15 after 15% off, 4 in stock
const soldOut = products.find((p) => p.stock === 0);

describe("cart operations", () => {
  it("adds a new product and increases an existing one", () => {
    let result = addToCart([], headphones, 2);
    expect(result).toMatchObject({ ok: true, cart: [{ id: 1, quantity: 2 }] });
    result = addToCart(result.cart, headphones, 1);
    expect(result.cart).toEqual([{ id: 1, quantity: 3 }]);
  });

  it("never goes over the stock", () => {
    const full = addToCart([], laptop, 4).cart;
    const result = addToCart(full, laptop, 1);
    expect(result).toMatchObject({ ok: false, reason: "stock-limit" });
    expect(result.cart).toBe(full);
  });

  it("refuses sold out products", () => {
    expect(addToCart([], soldOut, 1)).toMatchObject({ ok: false, reason: "out-of-stock" });
  });

  it("sets quantities, removing the item below one", () => {
    const cart = [{ id: 1, quantity: 2 }];
    expect(setCartQuantity(cart, headphones, 5).cart).toEqual([{ id: 1, quantity: 5 }]);
    expect(setCartQuantity(cart, headphones, 0)).toMatchObject({ ok: true, removed: true, cart: [] });
    expect(setCartQuantity(cart, headphones, 99)).toMatchObject({ ok: false, reason: "stock-limit" });
    expect(removeFromCart(cart, 1)).toEqual([]);
  });

  it("cleans saved carts", () => {
    const saved = [
      { id: 1, quantity: 2 },
      { id: 1, quantity: 5 },
      { id: 5, quantity: 50 },
      { id: 999, quantity: 1 },
      { id: soldOut.id, quantity: 1 },
      { id: 2, quantity: -3 },
      null,
      "junk",
    ];
    expect(cleanCart(saved, products)).toEqual([
      { id: 1, quantity: 2 },
      { id: 5, quantity: 4 },
    ]);
    expect(cleanCart("not a list", products)).toEqual([]);
    expect(cleanIdList([3, 3, 999, 4], products)).toEqual([3, 4]);
  });
});

describe("cart totals", () => {
  it("adds line totals without float noise and charges shipping under RM300", () => {
    const lines = getCartLines([{ id: 1, quantity: 1 }], products);
    const totals = getCartTotals(lines);
    expect(totals).toMatchObject({ subtotal: 199.2, shipping: 10, total: 209.2, itemCount: 1, isFreeShipping: false });
    expect(totals.remainingForFree).toBe(100.8);
  });

  it("gives free shipping from RM300", () => {
    const totals = getCartTotals(getCartLines([{ id: 1, quantity: 2 }], products));
    expect(totals).toMatchObject({ subtotal: 398.4, shipping: 0, total: 398.4, isFreeShipping: true, progress: 1 });
  });

  it("matches the original store maths for a mixed cart", () => {
    const totals = getCartTotals(getCartLines([{ id: 1, quantity: 3 }, { id: 5, quantity: 4 }], products));
    expect(totals.total).toBe(16234.2);
    expect(totals.itemCount).toBe(7);
  });

  it("is zero for an empty cart", () => {
    expect(getCartTotals([])).toMatchObject({ subtotal: 0, shipping: 0, total: 0, itemCount: 0, isFreeShipping: false });
  });
});

describe("id lists", () => {
  it("keeps recently viewed newest first, without duplicates, capped", () => {
    let list = [];
    [1, 2, 3, 2, 4, 5, 6, 7].forEach((id) => {
      list = pushRecent(list, id, 6);
    });
    expect(list).toEqual([7, 6, 5, 4, 2, 3]);
  });

  it("toggles wishlist ids", () => {
    expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
    expect(toggleId([1, 2], 1)).toEqual([2]);
  });
});
