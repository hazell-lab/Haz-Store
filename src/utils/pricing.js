// price after discount, rounded to cents
export function getSalePrice(product) {
  return Math.round(product.price * (100 - product.discount)) / 100;
}

// how much the discount saves
export function getSavings(product) {
  return Math.round((product.price - getSalePrice(product)) * 100) / 100;
}

// badge text for discounted products
export function getDealLabel(product) {
  if (product.discount >= 25) {
    return "Limited deal";
  }
  return product.discount + "% off";
}

// stock message and its style
export function getStockInfo(product) {
  if (product.stock === 0) {
    return { text: "Out of stock", tone: "out" };
  }
  if (product.stock <= 5) {
    return { text: "Only " + product.stock + " left", tone: "low" };
  }
  return { text: product.stock + " in stock", tone: "ok" };
}

export function isInStock(product) {
  return product.stock > 0;
}
