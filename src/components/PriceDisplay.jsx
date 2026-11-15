import { formatPrice } from "../utils/format.js";
import { getDealLabel, getSalePrice } from "../utils/pricing.js";

// sale price, with the old price when discounted
export function PriceDisplay({ product, showBadge = false }) {
  const salePrice = getSalePrice(product);
  const onSale = product.discount > 0;

  return (
    <div className="price-row">
      <span className={"price" + (onSale ? " is-sale" : "")}>{formatPrice(salePrice)}</span>
      {onSale && (
        <span className="old-price">
          <span className="visually-hidden">was </span>
          {formatPrice(product.price)}
        </span>
      )}
      {onSale && showBadge && <span className="badge badge-inline">{getDealLabel(product)}</span>}
    </div>
  );
}
