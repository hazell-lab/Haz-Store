import { CATALOG_URL } from "../config.js";

// check that one product has every field the app relies on
function isValidProduct(product) {
  return (
    product &&
    Number.isInteger(product.id) &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.price === "number" &&
    typeof product.discount === "number" &&
    typeof product.rating === "number" &&
    Number.isInteger(product.stock) &&
    typeof product.image === "string" &&
    typeof product.description === "string"
  );
}

// make sure the json has the expected shape (bad entries are dropped, not shown)
export function normalizeCatalog(data) {
  if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories)) {
    throw new Error("The product catalog has an unexpected format.");
  }
  const products = data.products.filter(isValidProduct).map((product) => ({ ...product, featured: Boolean(product.featured) }));
  const categories = data.categories
    .filter((category) => category && typeof category.name === "string")
    .map((category) => ({ name: category.name }));
  return { products, categories };
}

// load the catalog from the static json file
export async function fetchCatalog({ signal, fetcher = fetch } = {}) {
  const response = await fetcher(CATALOG_URL, { signal });
  if (!response.ok) {
    throw new Error("Could not load products (status " + response.status + ").");
  }
  return normalizeCatalog(await response.json());
}
