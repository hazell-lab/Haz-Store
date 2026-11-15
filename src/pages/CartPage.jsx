import { Link } from "react-router-dom";
import { CartItem } from "../components/CartItem.jsx";
import { CartTotals, ShipProgress } from "../components/CartSummary.jsx";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { Icon } from "../components/Icon.jsx";
import { EmptyState } from "../components/States.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePageTitle } from "../hooks/usePageMeta.js";

function CartContent() {
  const { lines, totals, setQuantity, remove, clear } = useCart();

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="bag"
        headingLevel={2}
        title="Your bag is empty."
        action={
          <Link to="/shop" className="btn btn-primary">
            Browse the collection
          </Link>
        }
      >
        Products you add will show up here, and they stay saved on this device.
      </EmptyState>
    );
  }

  return (
    <div className="cart-page-layout">
      <div>
        <h2 className="visually-hidden">Products in your bag</h2>
        <ul className="cart-page-list" aria-label="Products in your bag">
          {lines.map((line) => (
            <CartItem key={line.id} line={line} onQuantity={setQuantity} onRemove={remove} />
          ))}
        </ul>
        <div className="cart-page-actions">
          <Link to="/shop" className="btn-link">
            Continue shopping
          </Link>
          <button type="button" className="btn-link btn-link-muted" onClick={() => clear()}>
            Clear bag
          </button>
        </div>
      </div>

      <aside className="order-summary" aria-labelledby="cartSummaryTitle">
        <h2 className="form-title" id="cartSummaryTitle">
          Order summary
        </h2>
        <ShipProgress totals={totals} live />
        <CartTotals totals={totals} />
        <Link to="/checkout" className="btn btn-primary btn-full btn-large">
          Go to checkout <Icon name="arrow" />
        </Link>
        <ul className="summary-notes">
          <li>
            <Icon name="return" /> Returns within 14 days
          </li>
          <li>
            <Icon name="shield" /> 1-year warranty included
          </li>
        </ul>
      </aside>
    </div>
  );
}

export default function CartPage() {
  usePageTitle("Your bag");
  const { totals } = useCart();

  return (
    <section className="section section-alt page-section" aria-labelledby="cartPageTitle">
      <div className="container">
        <header className="section-header section-header-split">
          <div>
            <p className="kicker">Bag</p>
            <h1 className="section-title" id="cartPageTitle">
              Your bag{totals.itemCount > 0 ? " (" + totals.itemCount + ")" : ""}
            </h1>
          </div>
          <p className="section-subtitle">Saved on this device. Prices and stock are checked against the catalog.</p>
        </header>
        <CatalogGate skeletons={2}>
          <CartContent />
        </CatalogGate>
      </div>
    </section>
  );
}
