import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "../config.js";
import { renderApp } from "../test/renderApp.jsx";

describe("product page", () => {
  it("shows real product data, adds the chosen quantity and saves it as recently viewed", async () => {
    const { user } = renderApp("/product/1");
    expect(await screen.findByRole("heading", { level: 1, name: "Nova Wireless Headphones" })).toBeInTheDocument();
    expect(screen.getByText("You save RM49.80")).toBeInTheDocument();
    expect(screen.getByText("15 in stock", { selector: ".stock-text" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "More in Headphones" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByTestId("qty-value")).toHaveTextContent("3");
    await user.click(screen.getByRole("button", { name: /add to bag — rm597\.60/i }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.cart))).toEqual([{ id: 1, quantity: 3 }]);
    expect(screen.getByText("3 already in your bag")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.recent))).toEqual([1]);
  });

  it("caps the quantity at what is left in stock", async () => {
    // product 5 has 4 in stock, 3 are already in the bag
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 5, quantity: 3 }]));
    renderApp("/product/5");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  it("disables buying for sold out products", async () => {
    // product 6 is sold out
    renderApp("/product/6");
    expect(await screen.findByText("Out of stock", { selector: ".stock-text" })).toBeInTheDocument();
    screen.getAllByRole("button", { name: "Out of stock" }).forEach((button) => expect(button).toBeDisabled());
    expect(screen.queryByRole("button", { name: "Increase quantity" })).not.toBeInTheDocument();
  });

  it("shows a not found message for unknown products", async () => {
    renderApp("/product/999");
    expect(await screen.findByRole("heading", { level: 1, name: "Product not found." })).toBeInTheDocument();
  });

  it("orders recently viewed newest first without duplicates", async () => {
    window.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify([3, 1, 2]));
    renderApp("/product/2");
    await screen.findByRole("heading", { level: 1 });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.recent))).toEqual([2, 3, 1]);
  });
});
