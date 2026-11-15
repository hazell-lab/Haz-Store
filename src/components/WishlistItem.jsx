import { Link } from "react-router-dom";
import { PriceDisplay } from "./PriceDisplay.jsx";
import { ProductImage } from "./ProductImage.jsx";
import { StockText } from "./StockText.jsx";

// one saved product on the wishlist page
export function WishlistItem({ product, inCart, onAdd, onRemove }) {
  const outOfStock = product.stock === 0;

  return (
    <li className="cart-item">
      <div className="cart-thumb">
        <ProductImage src={product.image} alt="" />
      </div>
      <div className="cart-item-info">
        <h3 className="cart-item-name">
          <Link to={"/product/" + product.id}>{product.name}</Link>
        </h3>
        <PriceDisplay product={product} />
        <StockText product={product} onlyWhenLow />
        <button type="button" className="btn btn-primary btn-small" onClick={() => onAdd(product.id, 1)} disabled={outOfStock}>
          {outOfStock ? "Out of stock" : inCart ? "Add another" : "Add to bag"}
        </button>
      </div>
      <div className="cart-item-right">
        <span />
        <button type="button" className="remove-btn" onClick={() => onRemove(product.id)} aria-label={"Remove " + product.name + " from wishlist"}>
          Remove
        </button>
      </div>
    </li>
  );
}
