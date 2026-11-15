import { getSalePrice } from "./pricing.js";

// default value of every shop filter
export const DEFAULT_FILTERS = {
  q: "",
  category: "all",
  price: "all",
  rating: "all",
  availability: "all",
  sort: "featured",
};

// options for the selects (the label is also used for the filter chips)
export const PRICE_OPTIONS = [
  { value: "all", label: "All prices" },
  { value: "under100", label: "Under RM100" },
  { value: "100-300", label: "RM100 - RM300" },
  { value: "300-1000", label: "RM300 - RM1000" },
  { value: "above1000", label: "Above RM1000" },
];

export const RATING_OPTIONS = [
  { value: "all", label: "All ratings" },
  { value: "4", label: "4 stars and above" },
  { value: "3", label: "3 stars and above" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Rating" },
  { value: "name", label: "Name: A-Z" },
];

function hasOption(options, value) {
  return options.some((option) => option.value === value);
}

function labelOf(options, value) {
  const option = options.find((item) => item.value === value);
  return option ? option.label : value;
}

// read filters from the url, ignoring values that are not allowed
export function parseFilters(searchParams, categoryNames) {
  const get = (key) => searchParams.get(key) || DEFAULT_FILTERS[key];
  const category = get("category");
  const price = get("price");
  const rating = get("rating");
  const availability = get("availability");
  const sort = get("sort");

  return {
    q: (searchParams.get("q") || "").slice(0, 80),
    category: category === "all" || categoryNames.includes(category) ? category : "all",
    price: hasOption(PRICE_OPTIONS, price) ? price : "all",
    rating: hasOption(RATING_OPTIONS, rating) ? rating : "all",
    availability: hasOption(AVAILABILITY_OPTIONS, availability) ? availability : "all",
    sort: hasOption(SORT_OPTIONS, sort) ? sort : "featured",
  };
}

// only keep non default values in the url
export function filtersToParams(filters) {
  const params = new URLSearchParams();
  Object.keys(DEFAULT_FILTERS).forEach((key) => {
    const value = filters[key];
    if (value && value !== DEFAULT_FILTERS[key]) {
      params.set(key, value);
    }
  });
  return params;
}

// search by name or category (case does not matter)
export function searchProducts(list, query) {
  const term = query.trim().toLowerCase();
  if (term === "") {
    return list;
  }
  return list.filter(
    (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
  );
}

// price ranges use the sale price
export function matchesPrice(product, range) {
  const price = getSalePrice(product);
  switch (range) {
    case "under100":
      return price < 100;
    case "100-300":
      return price >= 100 && price <= 300;
    case "300-1000":
      return price > 300 && price <= 1000;
    case "above1000":
      return price > 1000;
    default:
      return true;
  }
}

// category, price, rating and stock filters all combine
export function filterProducts(list, filters) {
  return list.filter((product) => {
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    if (!matchesPrice(product, filters.price)) {
      return false;
    }
    if (filters.rating !== "all" && product.rating < Number(filters.rating)) {
      return false;
    }
    if (filters.availability === "in-stock" && product.stock === 0) {
      return false;
    }
    if (filters.availability === "out-of-stock" && product.stock > 0) {
      return false;
    }
    return true;
  });
}

export function sortProducts(list, sort) {
  const sorted = [...list];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => getSalePrice(a) - getSalePrice(b));
    case "price-high":
      return sorted.sort((a, b) => getSalePrice(b) - getSalePrice(a));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      // featured first, then by id
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
  }
}

// search, filter and sort in one go
export function getShopResults(products, filters) {
  return sortProducts(filterProducts(searchProducts(products, filters.q), filters), filters.sort);
}

// removable chips for every active filter (sort is not a filter)
export function getActiveFilterChips(filters) {
  const chips = [];
  if (filters.q.trim() !== "") {
    chips.push({ key: "q", label: "“" + filters.q.trim() + "”" });
  }
  if (filters.category !== "all") {
    chips.push({ key: "category", label: filters.category });
  }
  if (filters.price !== "all") {
    chips.push({ key: "price", label: labelOf(PRICE_OPTIONS, filters.price) });
  }
  if (filters.rating !== "all") {
    chips.push({ key: "rating", label: labelOf(RATING_OPTIONS, filters.rating) });
  }
  if (filters.availability !== "all") {
    chips.push({ key: "availability", label: labelOf(AVAILABILITY_OPTIONS, filters.availability) });
  }
  return chips;
}

// quick suggestions for the header search, names that start with the term come first
export function getSearchSuggestions(products, query, limit = 6) {
  const term = query.trim().toLowerCase();
  if (term === "") {
    return [];
  }
  const startsWith = (product) => Number(product.name.toLowerCase().startsWith(term));
  return [...searchProducts(products, term)]
    .sort((a, b) => startsWith(b) - startsWith(a) || a.id - b.id)
    .slice(0, limit);
}
