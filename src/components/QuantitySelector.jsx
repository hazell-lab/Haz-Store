import { useId } from "react";
import { Icon } from "./Icon.jsx";

// minus / number / plus stepper
// itemName makes the button labels specific, e.g. "Increase quantity of Nova Buds Pro"
export function QuantitySelector({ value, min = 1, max, onChange, itemName, large = false, allowBelowMin = false }) {
  const labelId = useId();
  const suffix = itemName ? " of " + itemName : "";
  const canDecrease = allowBelowMin || value > min;
  const canIncrease = max === undefined || value < max;

  return (
    <div className={"qty-control" + (large ? " qty-large" : "")} role="group" aria-labelledby={labelId}>
      <span className="visually-hidden" id={labelId}>
        {"Quantity" + suffix}
      </span>
      <button type="button" onClick={() => onChange(value - 1)} disabled={!canDecrease} aria-label={"Decrease quantity" + suffix}>
        <Icon name="minus" />
      </button>
      <span aria-live="polite" data-testid="qty-value">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={!canIncrease} aria-label={"Increase quantity" + suffix}>
        <Icon name="plus" />
      </button>
    </div>
  );
}
