// store rules and limits (kept the same as the original vanilla version)
export const STORAGE_KEYS = {
  cart: "HazStoreCart",
  wishlist: "HazStoreWishlist",
  recent: "HazStoreRecent",
  theme: "HazStoreTheme",
};

export const SHIPPING_FEE = 10;
export const FREE_SHIPPING_LIMIT = 300;
export const RECENT_LIMIT = 6;
export const FEATURED_LIMIT = 5;
export const DEALS_LIMIT = 4;
export const TOP_RATED_LIMIT = 4;
export const SPOTLIGHT_LIMIT = 3;
export const RELATED_LIMIT = 4;

// shop page size by screen width
export const PAGE_SIZES = { small: 8, medium: 9, large: 12 };

// where the product catalog is loaded from (a static json file, no backend)
export const CATALOG_URL = `${import.meta.env.BASE_URL}data/products.json`;

// fake delay for the demo checkout so the loading state is visible
export const DEMO_ORDER_DELAY = 900;

export const PAYMENT_METHODS = [
  { value: "Credit/debit card", icon: "card" },
  { value: "Online banking", icon: "bank" },
  { value: "Cash on delivery", icon: "cash" },
];

export const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Melaka",
  "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya",
  "Sabah", "Sarawak", "Selangor", "Terengganu",
];
