import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantitySelector } from "./QuantitySelector.jsx";

describe("QuantitySelector", () => {
  it("steps up and down within the limits", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<QuantitySelector value={1} max={2} onChange={onChange} itemName="Mouse" />);
    expect(screen.getByRole("button", { name: "Decrease quantity of Mouse" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Increase quantity of Mouse" }));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<QuantitySelector value={2} max={2} onChange={onChange} itemName="Mouse" />);
    expect(screen.getByRole("button", { name: "Increase quantity of Mouse" })).toBeDisabled();
  });

  it("can go below the minimum when that removes the item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={1} max={5} onChange={onChange} allowBelowMin />);
    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
