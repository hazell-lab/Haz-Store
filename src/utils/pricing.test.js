import { describe, expect, it } from "vitest";
import { formatPrice, pad } from "./format.js";
import { getDealLabel, getSalePrice, getSavings, getStockInfo } from "./pricing.js";

const base = { id: 1, name: "Test", category: "Mice", price: 249, discount: 20, rating: 4.5, stock: 10 };

describe("pricing", () => {
  it("calculates the sale price rounded to cents", () => {
    expect(getSalePrice(base)).toBe(199.2);
    expect(getSalePrice({ ...base, price: 4599, discount: 15 })).toBe(3909.15);
    expect(getSalePrice({ ...base, discount: 0 })).toBe(249);
  });

  it("calculates savings", () => {
    expect(getSavings(base)).toBe(49.8);
  });

  it("labels big discounts as limited deals", () => {
    expect(getDealLabel({ ...base, discount: 25 })).toBe("Limited deal");
    expect(getDealLabel({ ...base, discount: 10 })).toBe("10% off");
  });

  it("describes stock levels", () => {
    expect(getStockInfo({ ...base, stock: 0 })).toEqual({ text: "Out of stock", tone: "out" });
    expect(getStockInfo({ ...base, stock: 5 })).toEqual({ text: "Only 5 left", tone: "low" });
    expect(getStockInfo({ ...base, stock: 6 })).toEqual({ text: "6 in stock", tone: "ok" });
  });
});

describe("format", () => {
  it("formats ringgit with two decimals and separators", () => {
    expect(formatPrice(16234.2)).toBe("RM16,234.20");
    expect(formatPrice(0)).toBe("RM0.00");
  });

  it("pads numbers to two digits", () => {
    expect(pad(3)).toBe("03");
    expect(pad(12)).toBe("12");
  });
});
