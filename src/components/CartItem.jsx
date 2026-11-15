import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format.js";
import { ProductImage } from "./ProductImage.jsx";
import { QuantitySelector } from "./QuantitySelector.jsx";

// one line in the bag (drawer and bag page)
export function CartItem({ line, onQuantity, onRemove, onNavigate }) {
  const { product, quantity, unitPrice, lineTotal } = line;

  return (
    <li className="cart-item">
      <div className="cart-thumb">
        <ProductImage src={product.image} alt="" />
      </div>
      <div className="cart-item-info">
        <h3 className="cart-item-name">
          <Link to={"/product/" + product.id} onClick={onNavigate}>
            {product.name}
          </Link>
        </h3>
        <p className="cart-item-price">{formatPrice(unitPrice)} each</p>
        <QuantitySelector
          value={quantity}
          max={product.stock}
          allowBelowMin
          itemName={product.name}
          onChange={(next) => onQuantity(product.id, next)}
        />
      </div>
      <div className="cart-item-right">
        <span className="cart-item-subtotal">{formatPrice(lineTotal)}</span>
        <button type="button" className="remove-btn" onClick={() => onRemove(product.id)} aria-label={"Remove " + product.name + " from cart"}>
          Remove
        </button>
      </div>
    </li>
  );
}
