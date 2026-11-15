import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import catalogJson from "../../public/data/products.json";
import { renderApp } from "../test/renderApp.jsx";

const okResponse = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(catalogJson) });

describe("catalog loading", () => {
  it("shows a loading state, then the products", async () => {
    const fetcher = vi.fn(okResponse);
    renderApp("/shop", { fetcher });
    // the page chunk or the catalog shows a loading status first
    expect(screen.getAllByRole("status").some((node) => /loading/i.test(node.textContent))).toBe(true);
    expect(await screen.findByText("All 20 products")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("shows an error with a retry that works", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockImplementation(okResponse);
    const { user } = renderApp("/shop", { fetcher });
    expect(await screen.findByRole("alert")).toHaveTextContent("Products could not be loaded.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("All 20 products")).toBeInTheDocument();
  });
});

describe("header", () => {
  it("suggests products while typing and opens the shop on enter", async () => {
    const { user } = renderApp("/");
    await user.click(screen.getByRole("button", { name: "Search products" }));
    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    await user.type(input, "nova");
    expect(screen.getAllByRole("option").length).toBeGreaterThan(1);
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location")).toHaveTextContent("/shop?q=nova");
    expect(await screen.findByText(/products match/)).toBeInTheDocument();
  });

  it("opens a product from the suggestions with the keyboard", async () => {
    const { user } = renderApp("/");
    await user.click(screen.getByRole("button", { name: "Search products" }));
    await user.type(screen.getByRole("combobox"), "aero slim");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(await screen.findByRole("heading", { level: 1, name: "Aero Slim Laptop 14" })).toBeInTheDocument();
  });

  it("opens and closes the mobile menu", async () => {
    const { user } = renderApp("/");
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the shop link as the current page", async () => {
    renderApp("/shop");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
  });
});

describe("home page", () => {
  it("only shows sections the data supports", async () => {
    renderApp("/");
    expect(screen.getByRole("heading", { level: 1, name: "Technology, edited." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Highest rated, in stock." })).toBeInTheDocument();
    expect(screen.queryByText(/new arrivals|best sellers/i)).not.toBeInTheDocument();
    // recently viewed stays hidden until a product is opened
    expect(screen.queryByRole("heading", { name: "Recently viewed" })).not.toBeInTheDocument();
  });

  it("switches spotlight products with the arrow keys", async () => {
    const { user } = renderApp("/");
    const tabs = screen.getAllByRole("tab");
    await user.click(tabs[0]);
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();
  });

  it("shows a 404 page for unknown routes", async () => {
    renderApp("/does-not-exist");
    expect(await screen.findByRole("heading", { level: 1, name: "This page does not exist." })).toBeInTheDocument();
  });
});
