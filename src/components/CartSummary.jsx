import { formatPrice } from "../utils/format.js";

// free shipping message with a progress bar
export function ShipProgress({ totals, className = "ship-progress", live = false }) {
  if (totals.itemCount === 0) {
    return null;
  }
  return (
    <div className={className + (totals.isFreeShipping ? " is-free" : "")} aria-live={live ? "polite" : undefined}>
      <p>
        {totals.isFreeShipping ? (
          <strong>You got free shipping!</strong>
        ) : (
          <>
            Add <strong>{formatPrice(totals.remainingForFree)}</strong> more for free shipping
          </>
        )}
      </p>
      <div className="ship-bar" aria-hidden="true">
        <span style={{ transform: "scaleX(" + totals.progress + ")" }} />
      </div>
    </div>
  );
}

// subtotal, shipping and total rows
export function CartTotals({ totals }) {
  return (
    <div className="totals">
      <div className="totals-row">
        <span>Subtotal</span>
        <span data-testid="subtotal">{formatPrice(totals.subtotal)}</span>
      </div>
      <div className="totals-row">
        <span>Shipping</span>
        <span data-testid="shipping">{totals.isFreeShipping ? "Free" : formatPrice(totals.shipping)}</span>
      </div>
      <div className="totals-row totals-final">
        <span>Total</span>
        <span data-testid="total">{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
}
