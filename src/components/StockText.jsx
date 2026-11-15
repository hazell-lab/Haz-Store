import { getStockInfo } from "../utils/pricing.js";

// stock message (on cards it only shows when stock is low or sold out)
export function StockText({ product, onlyWhenLow = false }) {
  if (onlyWhenLow && product.stock > 5) {
    return null;
  }
  const { text, tone } = getStockInfo(product);
  return <p className={"stock-text stock-" + tone}>{text}</p>;
}
