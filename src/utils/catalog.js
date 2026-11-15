export function getProductById(products, id) {
  return products.find((product) => product.id === id);
}

export function getProductsInCategory(products, categoryName) {
  return products.filter((product) => product.category === categoryName);
}

// image that represents a category (a featured product if there is one)
export function getCategoryCover(products, categoryName) {
  const list = getProductsInCategory(products, categoryName);
  return list.find((product) => product.featured) || list[0];
}

export function getFeatured(products, limit) {
  return products.filter((product) => product.featured).slice(0, limit);
}

// biggest discounts first
export function getDeals(products, limit) {
  return products
    .filter((product) => product.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

// highest rated products that can be bought right now
export function getTopRated(products, limit) {
  return products
    .filter((product) => product.stock > 0)
    .sort((a, b) => b.rating - a.rating || a.id - b.id)
    .slice(0, limit);
}

// featured products from different categories, for the hero
export function pickSpotlight(products, limit) {
  const used = [];
  return products
    .filter((product) => {
      if (!product.featured || used.includes(product.category)) {
        return false;
      }
      used.push(product.category);
      return true;
    })
    .slice(0, limit);
}

// "more like this": same category, or featured products when there are too few
export function getRelated(products, product, limit) {
  let related = getProductsInCategory(products, product.category).filter((item) => item.id !== product.id);
  let title = "More in " + product.category;

  if (related.length < 2) {
    related = related.concat(
      products.filter((item) => item.featured && item.id !== product.id && !related.includes(item))
    );
    title = "You may also like";
  }

  return { title, items: related.slice(0, limit) };
}

// numbers for the about section, calculated from the real data
export function getStoreStats(products, categories) {
  const averageRating = products.length
    ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
    : 0;
  return { productCount: products.length, categoryCount: categories.length, averageRating };
}
