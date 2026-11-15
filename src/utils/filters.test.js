import { describe, expect, it } from "vitest";
import { catalog } from "../test/renderApp.jsx";
import {
  DEFAULT_FILTERS,
  filtersToParams,
  getActiveFilterChips,
  getSearchSuggestions,
  getShopResults,
  parseFilters,
  searchProducts,
  sortProducts,
} from "./filters.js";
import { getSalePrice } from "./pricing.js";

const { products, categories } = catalog;
const names = categories.map((category) => category.name);
const filters = (overrides) => ({ ...DEFAULT_FILTERS, ...overrides });

describe("search", () => {
  it("matches name or category, ignoring case and spaces", () => {
    expect(searchProducts(products, "  NOVA PHONE ").map((p) => p.name)).toEqual(
      expect.arrayContaining(["Nova Phone X"])
    );
    expect(searchProducts(products, "mice")).toHaveLength(3);
    expect(searchProducts(products, "zzz")).toHaveLength(0);
    expect(searchProducts(products, "")).toHaveLength(products.length);
  });
});

describe("filters", () => {
  it("filters by category", () => {
    const result = getShopResults(products, filters({ category: "Laptops" }));
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.category === "Laptops")).toBe(true);
  });

  it("uses the sale price for price ranges", () => {
    const under100 = getShopResults(products, filters({ price: "under100" }));
    expect(under100.length).toBeGreaterThan(0);
    expect(under100.every((p) => getSalePrice(p) < 100)).toBe(true);
    const above1000 = getShopResults(products, filters({ price: "above1000" }));
    expect(above1000.every((p) => getSalePrice(p) > 1000)).toBe(true);
  });

  it("filters by minimum rating and availability", () => {
    expect(getShopResults(products, filters({ rating: "4" })).every((p) => p.rating >= 4)).toBe(true);
    const soldOut = getShopResults(products, filters({ availability: "out-of-stock" }));
    expect(soldOut).toHaveLength(3);
    expect(soldOut.every((p) => p.stock === 0)).toBe(true);
    expect(getShopResults(products, filters({ availability: "in-stock" }))).toHaveLength(products.length - 3);
  });

  it("combines search, category, price, rating and availability", () => {
    const result = getShopResults(products, filters({ category: "Mice", price: "under100" }));
    expect(result).toHaveLength(1);
    const combined = getShopResults(products, filters({ q: "nova", rating: "4", availability: "in-stock", price: "100-300" }));
    combined.forEach((p) => {
      expect(p.name.toLowerCase().includes("nova") || p.category.toLowerCase().includes("nova")).toBe(true);
      expect(p.rating).toBeGreaterThanOrEqual(4);
      expect(p.stock).toBeGreaterThan(0);
      expect(getSalePrice(p)).toBeGreaterThanOrEqual(100);
      expect(getSalePrice(p)).toBeLessThanOrEqual(300);
    });
  });
});

describe("sort", () => {
  it("sorts by sale price both ways", () => {
    const low = sortProducts(products, "price-low").map(getSalePrice);
    expect(low).toEqual([...low].sort((a, b) => a - b));
    const high = sortProducts(products, "price-high").map(getSalePrice);
    expect(high).toEqual([...high].sort((a, b) => b - a));
    expect(sortProducts(products, "price-low")[0].name).toBe("Laptop Sleeve 14 inch");
  });

  it("sorts by rating and name", () => {
    const ratings = sortProducts(products, "rating").map((p) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    const sortedNames = sortProducts(products, "name").map((p) => p.name);
    expect(sortedNames).toEqual([...sortedNames].sort((a, b) => a.localeCompare(b)));
  });

  it("puts featured products first, then by id", () => {
    const result = sortProducts(products, "featured");
    const firstNormal = result.findIndex((p) => !p.featured);
    expect(result.slice(firstNormal).every((p) => !p.featured)).toBe(true);
    const featuredIds = result.slice(0, firstNormal).map((p) => p.id);
    expect(featuredIds).toEqual([...featuredIds].sort((a, b) => a - b));
  });

  it("does not change the original list", () => {
    const before = products.map((p) => p.id);
    sortProducts(products, "name");
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe("url params", () => {
  it("reads valid values and ignores unknown ones", () => {
    const parsed = parseFilters(new URLSearchParams("category=Mice&price=under100&rating=9&sort=bogus&q=nova"), names);
    expect(parsed).toEqual({ ...DEFAULT_FILTERS, category: "Mice", price: "under100", q: "nova" });
    expect(parseFilters(new URLSearchParams("category=Toasters"), names).category).toBe("all");
  });

  it("writes only non default values", () => {
    expect(filtersToParams(filters({ category: "Mice", sort: "featured" })).toString()).toBe("category=Mice");
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("makes chips for active filters", () => {
    const chips = getActiveFilterChips(filters({ q: "nova", price: "100-300", availability: "in-stock" }));
    expect(chips.map((chip) => chip.key)).toEqual(["q", "price", "availability"]);
    expect(chips[1].label).toBe("RM100 - RM300");
  });
});

describe("search suggestions", () => {
  it("lists names that start with the term first, up to the limit", () => {
    const result = getSearchSuggestions(products, "nova", 3);
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.name.toLowerCase().startsWith("nova"))).toBe(true);
    expect(getSearchSuggestions(products, " ")).toEqual([]);
  });
});
