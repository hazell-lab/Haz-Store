import { Link, useNavigate } from "react-router-dom";
import { useUI } from "../context/UIContext.jsx";
import { useCart } from "../hooks/useCart.js";
import { useDialog } from "../hooks/useDialog.js";
import { CartItem } from "./CartItem.jsx";
import { CartTotals, ShipProgress } from "./CartSummary.jsx";
import { Icon } from "./Icon.jsx";
import { EmptyState } from "./States.jsx";

// slide-in bag, always in the page so it can animate in and out
export function CartDrawer() {
  const { panel, closePanel } = useUI();
  const { lines, totals, setQuantity, remove, clear } = useCart();
  const navigate = useNavigate();
  const open = panel === "cart";
  const ref = useDialog(open, closePanel);

  function goTo(path) {
    closePanel();
    navigate(path);
  }

  return (
    <aside
      ref={ref}
      className={"drawer" + (open ? " open" : "")}
      id="cartDrawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartTitle"
      aria-hidden={!open}
    >
      <div className="drawer-header">
        <h2 id="cartTitle">
          Your bag <span className="drawer-count">{totals.itemCount > 0 ? "(" + totals.itemCount + ")" : ""}</span>
        </h2>
        <button type="button" className="icon-btn drawer-close" onClick={closePanel} aria-label="Close bag">
          <Icon name="close" />
        </button>
      </div>
      <ShipProgress totals={totals} className="ship-progress drawer-ship" live />
      <ul className="drawer-body">
        {lines.length === 0 ? (
          <EmptyState
            as="li"
            icon="bag"
            title="Your bag is empty."
            action={
              <Link to="/shop" className="btn btn-outline" onClick={closePanel}>
                Continue shopping
              </Link>
            }
          >
            Start with our editor&apos;s selection or browse the full collection.
          </EmptyState>
        ) : (
          lines.map((line) => (
            <CartItem key={line.id} line={line} onQuantity={setQuantity} onRemove={remove} onNavigate={closePanel} />
          ))
        )}
      </ul>
      {lines.length > 0 && (
        <div className="drawer-footer">
          <CartTotals totals={totals} />
          <button type="button" className="btn btn-primary btn-full btn-large" onClick={() => goTo("/checkout")}>
            Go to checkout <Icon name="arrow" />
          </button>
          <div className="drawer-links">
            <button type="button" className="btn-link" onClick={() => goTo("/cart")}>
              View full bag
            </button>
            <button type="button" className="btn-link btn-link-muted" onClick={() => clear()}>
              Clear bag
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
