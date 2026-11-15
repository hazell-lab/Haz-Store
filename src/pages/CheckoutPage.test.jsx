import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "../config.js";
import { renderApp } from "../test/renderApp.jsx";

async function fillForm(user) {
  await user.type(screen.getByLabelText("Full name"), "Test Buyer");
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Phone number"), "012-345 6789");
  await user.type(screen.getByLabelText("Address"), "1 Jalan Test");
  await user.type(screen.getByLabelText("City"), "Shah Alam");
  await user.type(screen.getByLabelText("Postcode"), "40000");
  await user.selectOptions(screen.getByLabelText("State"), "Selangor");
}

describe("demo checkout", () => {
  it("shows an empty state without items", async () => {
    renderApp("/checkout");
    await screen.findByRole("heading", { level: 1, name: "Almost yours." });
    const main = within(screen.getByRole("main"));
    expect(main.getByText(/your bag is empty/i)).toBeInTheDocument();
    expect(main.getByText("Demo checkout.")).toBeInTheDocument();
  });

  it("validates every field, focuses the first error and clears errors while typing", async () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 1, quantity: 1 }]));
    const { user } = renderApp("/checkout");
    await user.click(await screen.findByRole("button", { name: /place demo order/i }));

    const name = screen.getByLabelText("Full name");
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelectorAll(".input-error")).toHaveLength(7);
    expect(screen.getByText("Postcode must be 5 digits")).toBeInTheDocument();

    await user.type(name, "T");
    expect(name).toHaveAttribute("aria-invalid", "false");
  });

  it("shows a loading state, then a clearly labelled demo confirmation and clears the bag", async () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 1, quantity: 1 }]));
    const { user } = renderApp("/checkout");
    await screen.findByRole("button", { name: /place demo order/i });
    await fillForm(user);
    await user.click(screen.getByRole("radio", { name: /online banking/i }));
    expect(screen.getByRole("button", { name: /place demo order/i })).toHaveTextContent("RM209.20");

    await user.click(screen.getByRole("button", { name: /place demo order/i }));
    expect(screen.getByRole("button", { name: /placing demo order/i })).toBeDisabled();

    const heading = await screen.findByRole("heading", { name: "Thank you, Test Buyer." }, { timeout: 3000 });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/no payment was taken and nothing will be shipped/i)).toBeInTheDocument();
    expect(screen.getByText(/^HAZ-\d{6}$/)).toBeInTheDocument();
    expect(screen.getAllByText("Online banking").length).toBeGreaterThan(0);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.cart))).toEqual([]);
  });

  it("never asks for card numbers", async () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ id: 1, quantity: 1 }]));
    renderApp("/checkout");
    await screen.findByRole("button", { name: /place demo order/i });
    expect(screen.queryByLabelText(/card number|cvv|expiry/i)).not.toBeInTheDocument();
  });
});
