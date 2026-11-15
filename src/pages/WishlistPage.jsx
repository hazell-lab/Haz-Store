import { Link } from "react-router-dom";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { EmptyState } from "../components/States.jsx";
import { WishlistItem } from "../components/WishlistItem.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePageTitle } from "../hooks/usePageMeta.js";
import { useWishlist } from "../hooks/useWishlist.js";

function WishlistContent() {
  const { items, toggle } = useWishlist();
  const { add, getQuantity } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        headingLevel={2}
        title="Nothing saved yet."
        action={
          <Link to="/shop" className="btn btn-primary">
            Browse products
          </Link>
        }
      >
        Tap the heart on any product to save it here for later.
      </EmptyState>
    );
  }

  return (
    <>
      <h2 className="visually-hidden">Saved products</h2>
      <ul className="wishlist-list" aria-label="Saved products">
        {items.map((product) => (
          <WishlistItem key={product.id} product={product} inCart={getQuantity(product.id) > 0} onAdd={add} onRemove={toggle} />
        ))}
      </ul>
    </>
  );
}

export default function WishlistPage() {
  usePageTitle("Wishlist");
  const { count } = useWishlist();

  return (
    <section className="section page-section" aria-labelledby="wishlistPageTitle">
      <div className="container">
        <header className="section-header section-header-split">
          <div>
            <p className="kicker">Saved for later</p>
            <h1 className="section-title" id="wishlistPageTitle">
              Wishlist{count > 0 ? " (" + count + ")" : ""}
            </h1>
          </div>
          <p className="section-subtitle">Your saved products stay on this device until you remove them.</p>
        </header>
        <CatalogGate skeletons={2}>
          <WishlistContent />
        </CatalogGate>
      </div>
    </section>
  );
}
