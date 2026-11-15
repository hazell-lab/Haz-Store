import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getDealLabel } from "../utils/pricing.js";
import { Icon } from "./Icon.jsx";
import { PriceDisplay } from "./PriceDisplay.jsx";
import { ProductImage } from "./ProductImage.jsx";
import { RatingBadge } from "./Rating.jsx";
import { StockText } from "./StockText.jsx";

// one product tile: image, wishlist heart, quick add, name, rating and price
// variant "deal" shows the big discount number used on the offers band
function ProductCardBase({ product, inWishlist, onAdd, onToggleWishlist, variant, index = 0, animate = false, eager = false }) {
  const outOfStock = product.stock === 0;
  const [added, setAdded] = useState(false);
  const [popped, setPopped] = useState(false);
  const timer = useRef(null);
  const url = "/product/" + product.id;

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleAdd() {
    if (onAdd(product.id, 1)) {
      // short "added" confirmation on the button
      setAdded(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 1400);
    }
  }

  const classes = ["product-card"];
  if (outOfStock) classes.push("is-soldout");
  if (animate) classes.push("is-new");

  return (
    <article className={classes.join(" ")} style={{ "--i": index }}>
      <div className="product-media">
        <Link className="product-image-button" to={url} tabIndex={-1} aria-hidden="true">
          <ProductImage src={product.image} alt={product.name} eager={eager} />
        </Link>
        {outOfStock && <span className="badge badge-sold">Sold out</span>}
        {!outOfStock && product.discount > 0 && variant !== "deal" && (
          <span className="badge badge-sale">{getDealLabel(product)}</span>
        )}
        {variant === "deal" && product.discount > 0 && !outOfStock && (
          <span className="deal-off" aria-hidden="true">
            &minus;{product.discount}
            <small>%</small>
          </span>
        )}
        <button
          type="button"
          className={"wishlist-btn" + (inWishlist ? " active" : "") + (inWishlist && popped ? " pop" : "")}
          onClick={() => {
            // small pop only when the heart is pressed, not on every render
            setPopped(!inWishlist);
            onToggleWishlist(product.id);
          }}
          aria-label={(inWishlist ? "Remove " : "Add ") + product.name + (inWishlist ? " from wishlist" : " to wishlist")}
          aria-pressed={inWishlist}
        >
          <Icon name="heart" />
        </button>
        <button
          type="button"
          className={"quick-add" + (added ? " added" : "")}
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={outOfStock ? product.name + " is out of stock" : "Add " + product.name + " to cart"}
        >
          {!outOfStock && <Icon name={added ? "check" : "plus"} />}
          <span className="quick-add-label">{outOfStock ? "Out of stock" : added ? "Added" : "Add to bag"}</span>
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <RatingBadge rating={product.rating} />
        </div>
        <h3 className="product-name">
          <Link to={url}>{product.name}</Link>
        </h3>
        <PriceDisplay product={product} />
        <StockText product={product} onlyWhenLow />
      </div>
    </article>
  );
}

// memo: a cart change does not re-render every card on the page
export const ProductCard = memo(ProductCardBase);
