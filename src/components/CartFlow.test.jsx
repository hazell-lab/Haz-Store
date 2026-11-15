import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "../config.js";
import { renderApp } from "../test/renderApp.jsx";

const savedCart = () => JSON.parse(window.localStorage.getItem(STORAGE_KEYS.cart));

describe("bag", () => {
  it("adds from a product card, updates the header count and saves to storage", async () => {
    const { user } = renderApp("/shop");
    await user.click(await screen.findByRole("button", { name: "Add Nova Wireless Headphones to cart" }));
    expect(screen.getByTestId("bag-count")).toHaveTextContent("1");
    expect(savedCart()).toEqual([{ id: 1, quantity: 1 }]);
    expect(screen.getByText("Nova Wireless Headphones added to your bag")).toBeInTheDocument();
  });

  it("opens the drawer and keeps totals right while quantities change", async () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 1, quantity: 1 }]));
    const { user } = renderApp("/");
    await user.click(screen.getByRole("button", { name: /open shopping bag/i }));
    const drawer = screen.getByRole("dialog", { name: /your bag/i });
    expect(within(drawer).getByTestId("shipping")).toHaveTextContent("RM10.00");
    expect(within(drawer).getByTestId("total")).toHaveTextContent("RM209.20");

    await user.click(within(drawer).getByRole("button", { name: "Increase quantity of Nova Wireless Headphones" }));
    expect(within(drawer).getByTestId("shipping")).toHaveTextContent("Free");
    expect(within(drawer).getByTestId("total")).toHaveTextContent("RM398.40");
    expect(savedCart()).toEqual([{ id: 1, quantity: 2 }]);

    await user.keyboard("{Escape}");
    expect(drawer).not.toHaveClass("open");
  });

  it("stops at the stock limit and removes at zero", async () => {
    // product 5 has 4 in stock
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 5, quantity: 4 }, { id: 2, quantity: 1 }]));
    const { user } = renderApp("/cart");
    const increase = await screen.findByRole("button", { name: "Increase quantity of Aero Book 15 Creator" });
    expect(increase).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Decrease quantity of Nova Buds Pro" }));
    expect(screen.queryByText("Nova Buds Pro")).not.toBeInTheDocument();
    expect(savedCart()).toEqual([{ id: 5, quantity: 4 }]);
  });

  it("drops invalid saved items and shows the empty state when cleared", async () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 999, quantity: 1 }, { id: 3, quantity: 100 }]));
    const { user } = renderApp("/cart");
    await screen.findByRole("heading", { level: 1, name: /your bag/i });
    // unknown id removed, quantity capped at the 8 in stock
    expect(savedCart()).toEqual([{ id: 3, quantity: 8 }]);
    await user.click(screen.getByRole("button", { name: "Clear bag" }));
    expect(within(screen.getByRole("main")).getByText("Your bag is empty.")).toBeInTheDocument();
    expect(savedCart()).toEqual([]);
  });
});

describe("wishlist", () => {
  it("toggles from a card, shows the count and lists the product on the wishlist page", async () => {
    const { user } = renderApp("/shop");
    const heart = await screen.findByRole("button", { name: "Add Nova Buds Pro to wishlist" });
    await user.click(heart);
    expect(heart).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Wishlist, 1 item" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.wishlist))).toEqual([2]);

    await user.click(screen.getByRole("link", { name: "Wishlist, 1 item" }));
    expect(await screen.findByRole("heading", { level: 1, name: /wishlist/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Nova Buds Pro from wishlist" }));
    expect(screen.getByText("Nothing saved yet.")).toBeInTheDocument();
  });
});
