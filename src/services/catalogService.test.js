import { describe, expect, it, vi } from "vitest";
import { fetchCatalog, normalizeCatalog } from "./catalogService.js";

describe("catalog service", () => {
  it("drops products with missing fields", () => {
    const result = normalizeCatalog({
      categories: [{ name: "Mice" }, { nope: true }],
      products: [
        { id: 1, name: "A", category: "Mice", price: 10, discount: 0, rating: 4, stock: 1, image: "/a.jpg", description: "x" },
        { id: "2", name: "B" },
      ],
    });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].featured).toBe(false);
    expect(result.categories).toEqual([{ name: "Mice" }]);
  });

  it("rejects data with the wrong shape", () => {
    expect(() => normalizeCatalog({ items: [] })).toThrow(/unexpected format/);
  });

  it("throws a readable error when the request fails", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchCatalog({ fetcher })).rejects.toThrow("status 500");
  });
});
