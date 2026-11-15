import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { Icon, ToggleIcon } from "../components/Icon.jsx";
import { PriceDisplay } from "../components/PriceDisplay.jsx";
import { ProductGallery } from "../components/ProductGallery.jsx";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { QuantitySelector } from "../components/QuantitySelector.jsx";
import { RatingStars } from "../components/Rating.jsx";
import { EmptyState } from "../components/States.jsx";
import { StockText } from "../components/StockText.jsx";
import { FREE_SHIPPING_LIMIT, RELATED_LIMIT, SHIPPING_FEE } from "../config.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePageTitle } from "../hooks/usePageMeta.js";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed.js";
import { useWishlist } from "../hooks/useWishlist.js";
import { getProductById, getRelated } from "../utils/catalog.js";
import { formatPrice } from "../utils/format.js";
import { getSalePrice, getSavings, getStockInfo } from "../utils/pricing.js";

function ProductDetail({ product }) {
  const { products } = useCatalog();
  const { add, getQuantity } = useCart();
  const { has, toggle } = useWishlist();
  const { items: recent, addViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);

  const salePrice = getSalePrice(product);
  const outOfStock = product.stock === 0;
  const inBag = getQuantity(product.id);
  // you can only add what is left after the bag
  const maxAddable = Math.max(product.stock - inBag, 0);
  const inWishlist = has(product.id);
  const related = useMemo(() => getRelated(products, product, RELATED_LIMIT), [products, product]);
  const recentOthers = recent.filter((item) => item.id !== product.id).slice(0, 4);

  usePageTitle(product.name);

  // a new product starts at quantity 1 and is saved as recently viewed
  useEffect(() => {
    setQuantity(1);
    addViewed(product.id);
  }, [product.id]);

  // keep the stepper inside what can still be added
  useEffect(() => {
    if (quantity > Math.max(maxAddable, 1)) {
      setQuantity(Math.max(maxAddable, 1));
    }
  }, [maxAddable, quantity]);

  function handleAdd() {
    if (add(product.id, quantity)) {
      setQuantity(1);
    }
  }

  const shippingText =
    salePrice >= FREE_SHIPPING_LIMIT
      ? "This product ships free."
      : "Free on orders " + formatPrice(FREE_SHIPPING_LIMIT) + " and above, otherwise a flat " + formatPrice(SHIPPING_FEE) + ".";

  // only facts that exist in the product data
  const facts = [
    ["Category", product.category],
    ["Rating", product.rating.toFixed(1) + " out of 5"],
    ["Availability", getStockInfo(product).text],
    ["Regular price", formatPrice(product.price)],
  ];
  if (product.discount > 0) {
    facts.push(["Discount", product.discount + "% (save " + formatPrice(getSavings(product)) + ")"]);
  }

  const addLabel = outOfStock ? "Out of stock" : maxAddable === 0 ? "All stock is in your bag" : "Add to bag — " + formatPrice(salePrice * quantity);

  return (
    <>
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to={"/shop?category=" + encodeURIComponent(product.category)}>{product.category}</Link></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container pdp-layout">
        <ProductGallery product={product} />

        <div className="modal-details pdp-details">
          <p className="modal-breadcrumb">
            <span className="product-category">{product.category}</span>
          </p>
          <h1 className="modal-title" id="productTitle">
            {product.name}
          </h1>
          <RatingStars rating={product.rating} />
          <div className="modal-price">
            <PriceDisplay product={product} showBadge />
            {product.discount > 0 && <p className="save-text">You save {formatPrice(getSavings(product))}</p>}
          </div>
          <p className="modal-description">{product.description}</p>
          <StockText product={product} />
          {inBag > 0 && (
            <p className="in-bag-note">
              <Icon name="check" /> {inBag} already in your bag
            </p>
          )}

          <div className="modal-buy">
            {!outOfStock && maxAddable > 0 && (
              <div className="modal-quantity">
                <QuantitySelector value={quantity} max={maxAddable} onChange={setQuantity} large />
              </div>
            )}
            <div className="modal-buy-row">
              <button type="button" className="btn btn-primary btn-large" onClick={handleAdd} disabled={outOfStock || maxAddable === 0}>
                {addLabel}
              </button>
              <button
                type="button"
                className={"btn btn-outline btn-large modal-wishlist" + (inWishlist ? " active" : "")}
                aria-pressed={inWishlist}
                onClick={() => toggle(product.id)}
              >
                <Icon name="heart" />
                <span className="visually-hidden">{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
              </button>
            </div>
          </div>

          <div className="modal-info">
            <details open>
              <summary>
                Product details <ToggleIcon />
              </summary>
              <div>
                <dl className="spec-list">
                  {facts.map(([term, detail]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
            <details>
              <summary>
                Delivery <ToggleIcon />
              </summary>
              <div>
                <ul>
                  <li>
                    <Icon name="truck" />
                    <span>{shippingText}</span>
                  </li>
                </ul>
              </div>
            </details>
            <details>
              <summary>
                Returns and warranty <ToggleIcon />
              </summary>
              <div>
                <ul>
                  <li>
                    <Icon name="return" />
                    <span>Changed your mind? Return within 14 days.</span>
                  </li>
                  <li>
                    <Icon name="shield" />
                    <span>Every product comes with a simple 1 year warranty.</span>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.items.length > 0 && (
        <section className="section section-tight pdp-more" aria-labelledby="relatedTitle">
          <div className="container">
            <h2 className="pdp-more-title" id="relatedTitle">
              {related.title}
            </h2>
            <ProductGrid products={related.items} className="related-grid" />
          </div>
        </section>
      )}

      {recentOthers.length > 0 && (
        <section className="section section-tight pdp-more" aria-labelledby="pdpRecentTitle">
          <div className="container">
            <h2 className="pdp-more-title" id="pdpRecentTitle">
              Recently viewed
            </h2>
            <ProductGrid products={recentOthers} className="related-grid" />
          </div>
        </section>
      )}

      <div className="mobile-buy-bar">
        <span className="price">{formatPrice(salePrice)}</span>
        <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={outOfStock || maxAddable === 0}>
          {outOfStock ? "Out of stock" : maxAddable === 0 ? "All in your bag" : "Add to bag"}
        </button>
      </div>
    </>
  );
}

function ProductRoute() {
  const { id } = useParams();
  const { products } = useCatalog();
  const product = /^\d+$/.test(id) ? getProductById(products, Number(id)) : undefined;

  if (!product) {
    return <ProductMissing />;
  }
  // key resets local state (quantity, zoom) when moving to another product
  return <ProductDetail key={product.id} product={product} />;
}

function ProductMissing() {
  usePageTitle("Product not found");
  return (
    <div className="container page-pad">
      <h1 className="page-title">Product not found.</h1>
      <EmptyState
        icon="search"
        headingLevel={2}
        action={
          <Link to="/shop" className="btn btn-primary">
            Browse all products
          </Link>
        }
      >
        This product does not exist or is no longer in the catalog.
      </EmptyState>
    </div>
  );
}

export default function ProductPage() {
  return (
    <div className="pdp">
      <CatalogGate skeletons={4} wrapClass="container page-pad">
        <ProductRoute />
      </CatalogGate>
    </div>
  );
}
