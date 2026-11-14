// storage keys
const CART_KEY = "HazStoreCart";
const WISHLIST_KEY = "HazStoreWishlist";
const RECENT_KEY = "HazStoreRecent";
const THEME_KEY = "HazStoreTheme";

// store settings
const SHIPPING_FEE = 10;
const FREE_SHIPPING_LIMIT = 300;
const RECENT_LIMIT = 6;
const FEATURED_LIMIT = 5;
const DEALS_LIMIT = 4;
const SPOTLIGHT_LIMIT = 3;
// page size matches full rows: 2 columns on phones, 3 on tablets, 4 on wide screens
const PAGE_SIZE = window.matchMedia("(max-width: 768px)").matches ? 8 : (window.matchMedia("(max-width: 1200px)").matches ? 9 : 12);
const RELATED_LIMIT = 4;

// placeholder image used when a product image is missing
const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f0f0f0"/><text x="200" y="210" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#636363">No image</text></svg>';
const placeholderImage = "data:image/svg+xml," + encodeURIComponent(placeholderSvg);

// page elements
const header = document.getElementById("header");
const categoryGrid = document.getElementById("categoryGrid");
const categoryPreview = document.getElementById("categoryPreview");
const categoryPills = document.getElementById("categoryPills");
const featuredGrid = document.getElementById("featuredGrid");
const productGrid = document.getElementById("productGrid");
const dealsGrid = document.getElementById("dealsGrid");
const recentGrid = document.getElementById("recentGrid");
const recentSection = document.getElementById("recent");
const resultsCount = document.getElementById("resultsCount");
const activeFilters = document.getElementById("activeFilters");
const filterCount = document.getElementById("filterCount");
const loadMore = document.getElementById("loadMore");
const loadMoreText = document.getElementById("loadMoreText");
const loadMoreBar = document.getElementById("loadMoreBar");
const spotlight = document.getElementById("spotlight");
const spotlightTabs = document.getElementById("spotlightTabs");
const aboutStats = document.getElementById("aboutStats");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const ratingFilter = document.getElementById("ratingFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortSelect = document.getElementById("sortSelect");
const clearFiltersBtn = document.getElementById("clearFilters");
const filterPanel = document.getElementById("filterPanel");

const cartCount = document.getElementById("cartCount");
const wishlistCount = document.getElementById("wishlistCount");
const cartItems = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartDrawerCount = document.getElementById("cartDrawerCount");
const shippingNote = document.getElementById("shippingNote");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartShipping = document.getElementById("cartShipping");
const cartTotal = document.getElementById("cartTotal");
const wishlistItems = document.getElementById("wishlistItems");

const checkoutSection = document.getElementById("checkout");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutShipProgress = document.getElementById("checkoutShipProgress");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderTotal = document.getElementById("placeOrderTotal");
const checkoutForm = document.getElementById("checkoutForm");
const orderSuccess = document.getElementById("orderSuccess");
const orderTitle = document.getElementById("orderTitle");
const orderMessage = document.getElementById("orderMessage");
const orderMeta = document.getElementById("orderMeta");

const cartDrawer = document.getElementById("cartDrawer");
const wishlistDrawer = document.getElementById("wishlistDrawer");
const overlay = document.getElementById("overlay");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const toastContainer = document.getElementById("toastContainer");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// app data (loaded from local storage and cleaned up)
let cart = cleanCart(loadFromStorage(CART_KEY));
let wishlist = cleanIdList(loadFromStorage(WISHLIST_KEY));
let recentlyViewed = cleanIdList(loadFromStorage(RECENT_KEY)).slice(0, RECENT_LIMIT);

// current filter values
const filters = {
    search: "",
    category: "all",
    price: "all",
    rating: "all",
    availability: "all",
    sort: "featured"
};

// how many shop products are shown (grows with "show more")
let visibleCount = PAGE_SIZE;

// modal data
let currentProductId = null;
let modalQuantity = 1;

// hero spotlight data
let spotlightProducts = [];
let spotlightIndex = 0;

// the button that opened a drawer or the modal (focus goes back to it on close)
let openerFocus = null;


/* local storage helpers */

// get saved data from local storage
// (try/catch because local storage can be blocked, e.g. in some private windows)
function loadFromStorage(key) {
    try {
        const saved = localStorage.getItem(key);
        const data = saved ? JSON.parse(saved) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

// save data to local storage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        // storage is full or blocked, the app still works without saving
    }
}

// keep only valid cart items, and never more than the stock
function cleanCart(savedCart) {
    const cleaned = [];

    savedCart.forEach(function (item) {
        if (!item || typeof item !== "object") {
            return;
        }

        const product = getProductById(item.id);
        const quantity = Math.floor(Number(item.quantity));
        const alreadyAdded = cleaned.some(function (cartItem) {
            return cartItem.id === item.id;
        });

        if (!product || product.stock === 0 || !(quantity > 0) || alreadyAdded) {
            return;
        }

        cleaned.push({ id: product.id, quantity: Math.min(quantity, product.stock) });
    });

    return cleaned;
}

// keep only ids of products that exist, without duplicates
function cleanIdList(savedIds) {
    return savedIds.filter(function (id, index) {
        return getProductById(id) !== undefined && savedIds.indexOf(id) === index;
    });
}

function saveCart() {
    saveToStorage(CART_KEY, cart);
}

function saveWishlist() {
    saveToStorage(WISHLIST_KEY, wishlist);
}

function saveRecentlyViewed() {
    saveToStorage(RECENT_KEY, recentlyViewed);
}


/* small helpers */

// find a product by its id
function getProductById(id) {
    return products.find(function (product) {
        return product.id === id;
    });
}

// price after discount
function getSalePrice(product) {
    return Math.round(product.price * (100 - product.discount)) / 100;
}

// show a number as money
function formatPrice(amount) {
    return "RM" + amount.toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// two digit number for editorial indexes (1 -> 01)
function pad(number) {
    return String(number).padStart(2, "0");
}

// badge text for discounted products
function getDealLabel(product) {
    if (product.discount >= 25) {
        return "Limited deal";
    }
    return product.discount + "% off";
}

// svg icon from the sprite in index.html
function icon(name, extraClass) {
    return '<svg class="icon' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
}

// star icons for a rating
function getStarsHtml(rating) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        const filled = rating >= i - 0.5;
        stars += icon("star", filled ? "icon-fill" : "icon-fill is-empty");
    }

    return stars;
}

// compact rating for product cards
function getRatingHtml(product) {
    return '<span class="rating" aria-label="Rated ' + product.rating.toFixed(1) + ' out of 5">' +
        icon("star", "icon-fill") + product.rating.toFixed(1) + '</span>';
}

// stock message and style
function getStockHtml(product) {
    if (product.stock === 0) {
        return '<p class="stock-text stock-out">Out of stock</p>';
    }
    if (product.stock <= 5) {
        return '<p class="stock-text stock-low">Only ' + product.stock + ' left</p>';
    }
    return '<p class="stock-text stock-ok">' + product.stock + ' in stock</p>';
}

// on cards, only show stock when it matters (low or sold out)
function getCardStockHtml(product) {
    if (product.stock > 5) {
        return "";
    }
    return getStockHtml(product);
}

// price with the old price when discounted
function getPriceHtml(product) {
    const salePrice = getSalePrice(product);

    if (product.discount > 0) {
        return '<span class="price is-sale">' + formatPrice(salePrice) + '</span>' +
            '<span class="old-price"><span class="visually-hidden">was </span>' + formatPrice(product.price) + '</span>';
    }
    return '<span class="price">' + formatPrice(salePrice) + '</span>';
}

// image tag with a fallback if the file is missing
function getImageHtml(src, alt, eager) {
    return '<img src="' + src + '" alt="' + alt + '" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') +
        ' decoding="async" onload="this.classList.add(&quot;is-loaded&quot;)" onerror="this.onerror=null;this.src=placeholderImage">';
}

// products in one category
function getProductsInCategory(categoryName) {
    return products.filter(function (product) {
        return product.category === categoryName;
    });
}

// image that represents a category (a featured product if there is one)
function getCategoryCover(categoryName) {
    const list = getProductsInCategory(categoryName);
    const featured = list.find(function (product) {
        return product.featured;
    });
    return featured || list[0];
}


/* keyboard focus helpers */

// remember the focused button, so focus can go back to it later
// (also works if the list was re-rendered and the button was replaced)
function getFocusInfo() {
    const element = document.activeElement;

    if (!element || element === document.body) {
        return null;
    }

    return {
        element: element,
        action: element.dataset.action,
        id: element.dataset.id,
        container: element.parentElement ? element.parentElement.closest("[id]") : null
    };
}

// put focus back on the remembered button (or the new copy of it)
function restoreFocus(info) {
    if (!info) {
        return false;
    }

    let target = info.element;

    // the old button was replaced, so look for the new copy of it
    if (!document.body.contains(target) && info.container && info.action) {
        let selector = '[data-action="' + info.action + '"]';
        if (info.id) {
            selector += '[data-id="' + info.id + '"]';
        }
        target = info.container.querySelector(selector);
    }

    if (!target) {
        return false;
    }

    target.focus({ preventScroll: true });

    // false if the button is hidden or disabled and could not take focus
    return document.activeElement === target;
}

// run a function that re-renders html, without losing keyboard focus
function keepFocus(renderFunction) {
    const info = getFocusInfo();

    renderFunction();

    if (restoreFocus(info)) {
        return;
    }

    // the item is gone (e.g. removed from the cart), so focus the drawer close button
    const drawer = info && info.container ? info.container.closest(".drawer.open") : null;
    if (drawer) {
        drawer.querySelector(".drawer-close").focus();
    }
}

// the drawer or modal that is open right now (or null)
function getOpenDialog() {
    if (!productModal.hidden) {
        return productModal.querySelector(".modal-box");
    }
    if (cartDrawer.classList.contains("open")) {
        return cartDrawer;
    }
    if (wishlistDrawer.classList.contains("open")) {
        return wishlistDrawer;
    }
    if (filterPanel.classList.contains("open")) {
        return filterPanel;
    }
    return null;
}

// keep the tab key inside the open drawer or modal
function trapFocus(event) {
    const dialog = getOpenDialog();

    if (!dialog) {
        return;
    }

    const focusable = Array.from(dialog.querySelectorAll("button:not([disabled]), a[href], input, select, summary"))
        .filter(function (element) {
            return element.offsetParent !== null || element.getClientRects().length > 0;
        });

    if (focusable.length === 0) {
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
    }
}

// show a short message (with an optional action button)
function showToast(message, action) {
    const toast = document.createElement("div");
    toast.className = "toast";

    const text = document.createElement("span");
    text.className = "toast-message";
    text.textContent = message;
    toast.appendChild(text);

    if (action) {
        const button = document.createElement("button");
        button.className = "toast-action";
        button.dataset.action = action.action;
        button.textContent = action.label;
        toast.appendChild(button);
    }

    // keep at most two toasts on screen
    while (toastContainer.children.length >= 2) {
        toastContainer.firstElementChild.remove();
    }

    toastContainer.appendChild(toast);

    // hide it after a short time
    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, action ? 4000 : 2500);
}


/* product cards */

function createProductCard(product, options) {
    const variant = options && options.variant ? options.variant : "";
    const index = options && options.index !== undefined ? options.index : 0;
    const animate = options && options.animate;
    const inWishlist = wishlist.includes(product.id);
    const outOfStock = product.stock === 0;

    // choose the badge
    let badgeHtml = "";
    if (outOfStock) {
        badgeHtml = '<span class="badge badge-sold">Sold out</span>';
    } else if (product.discount > 0 && variant !== "deal") {
        badgeHtml = '<span class="badge badge-sale">' + getDealLabel(product) + '</span>';
    }

    // big discount number on the offers band
    let dealHtml = "";
    if (variant === "deal" && product.discount > 0 && !outOfStock) {
        dealHtml = '<span class="deal-off" aria-hidden="true">&minus;' + product.discount + '<small>%</small></span>';
    }

    const classes = ["product-card"];
    if (outOfStock) {
        classes.push("is-soldout");
    }
    if (animate) {
        classes.push("is-new");
    }

    return `
        <article class="${classes.join(" ")}" style="--i:${index}">
            <div class="product-media">
                <button class="product-image-button" data-action="view-product" data-id="${product.id}" aria-label="View details for ${product.name}" tabindex="-1">
                    ${getImageHtml(product.image, product.name)}
                </button>
                ${badgeHtml}
                ${dealHtml}
                <button class="wishlist-btn ${inWishlist ? "active" : ""}" data-action="toggle-wishlist" data-id="${product.id}" aria-label="${inWishlist ? "Remove " + product.name + " from wishlist" : "Add " + product.name + " to wishlist"}" aria-pressed="${inWishlist}">
                    ${icon("heart")}
                </button>
                <button class="quick-add" data-action="add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""} aria-label="${outOfStock ? product.name + " is out of stock" : "Add " + product.name + " to cart"}">
                    ${outOfStock ? "" : icon("plus")}<span class="quick-add-label">${outOfStock ? "Out of stock" : "Add to bag"}</span>
                </button>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span class="product-category">${product.category}</span>
                    ${getRatingHtml(product)}
                </div>
                <h3 class="product-name">
                    <button data-action="view-product" data-id="${product.id}">${product.name}</button>
                </h3>
                <div class="price-row">${getPriceHtml(product)}</div>
                ${getCardStockHtml(product)}
            </div>
        </article>
    `;
}

// show a list of products inside a container
function renderProductList(list, container, emptyIcon, emptyMessage, options) {
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                ${icon(emptyIcon)}
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }

    const animateFrom = options && options.animateFrom !== undefined ? options.animateFrom : -1;
    const variant = options && options.variant;

    container.innerHTML = list.map(function (product, index) {
        return createProductCard(product, {
            variant: variant,
            index: Math.max(0, index - Math.max(animateFrom, 0)),
            animate: animateFrom >= 0 && index >= animateFrom
        });
    }).join("");
}


/* hero spotlight */

// pick featured products from different categories
function pickSpotlightProducts() {
    const usedCategories = [];

    return products.filter(function (product) {
        if (!product.featured || usedCategories.includes(product.category)) {
            return false;
        }
        usedCategories.push(product.category);
        return true;
    }).slice(0, SPOTLIGHT_LIMIT);
}

function renderSpotlightTabs() {
    spotlightTabs.innerHTML = spotlightProducts.map(function (product, index) {
        const selected = index === spotlightIndex;
        return `
            <button class="spotlight-tab" role="tab" id="spotlightTab${index}" aria-controls="spotlightPanel" aria-selected="${selected}" tabindex="${selected ? 0 : -1}" data-action="spotlight" data-index="${index}">
                <span class="spotlight-num">${pad(index + 1)}</span>
                <span class="spotlight-name">${product.name}</span>
                <span class="spotlight-price">${formatPrice(getSalePrice(product))}</span>
            </button>
        `;
    }).join("");
}

function renderSpotlight(animate) {
    const product = spotlightProducts[spotlightIndex];

    if (!product) {
        return;
    }

    document.getElementById("spotlightPanel").setAttribute("aria-labelledby", "spotlightTab" + spotlightIndex);
    spotlight.innerHTML = `
        <div class="stage-plate ${animate ? "is-entering" : ""}">
            <div class="stage-meta" aria-hidden="true">
                <span class="stage-index">${pad(spotlightIndex + 1)}</span>
                <span>${product.category}</span>
            </div>
            ${getImageHtml(product.image, product.name, true)}
        </div>
        <figcaption class="stage-caption">
            <div>
                <p class="stage-name">${product.name}</p>
                <p class="stage-desc">${product.description}</p>
            </div>
            <div class="stage-buy">
                <div class="price-row">${getPriceHtml(product)}</div>
                <button class="btn btn-outline btn-small" data-action="view-product" data-id="${product.id}">View product</button>
            </div>
        </figcaption>
    `;
}

function setSpotlight(index, moveFocus) {
    if (index === spotlightIndex || !spotlightProducts[index]) {
        return;
    }

    // tabs are re-rendered, so focus follows the selected tab

    spotlightIndex = index;
    renderSpotlightTabs();
    renderSpotlight(true);

    if (moveFocus) {
        document.getElementById("spotlightTab" + index).focus();
    }
}


/* page sections */

// show the category index, the shop pills and fill the category filter
function renderCategories() {
    categoryGrid.innerHTML = categories.map(function (category, index) {
        const cover = getCategoryCover(category.name);
        const count = getProductsInCategory(category.name).length;

        return `
            <li>
                <button class="category-card" data-action="filter-category" data-category="${category.name}" data-index="${index}">
                    <span class="category-num">${pad(index + 1)}</span>
                    <span class="category-thumb" aria-hidden="true">${cover ? getImageHtml(cover.image, "") : ""}</span>
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${count} <span class="visually-hidden">products</span></span>
                    ${icon("arrow")}
                </button>
            </li>
        `;
    }).join("");

    // large preview image that changes on hover
    categoryPreview.innerHTML = categories.map(function (category, index) {
        const cover = getCategoryCover(category.name);
        return cover ? '<img src="' + cover.image + '" alt="" loading="lazy" decoding="async" data-index="' + index + '" class="' + (index === 0 ? "is-active" : "") + '">' : "";
    }).join("") + '<div class="category-preview-label"><span id="previewName">' + categories[0].name + '</span><span>Shop now</span></div>';

    // quick category pills above the shop grid
    const pills = [{ name: "all", label: "All", count: products.length }].concat(categories.map(function (category) {
        return { name: category.name, label: category.name, count: getProductsInCategory(category.name).length };
    }));

    categoryPills.innerHTML = pills.map(function (pill) {
        return `
            <button class="pill" data-action="filter-pill" data-category="${pill.name}" aria-pressed="false">
                ${pill.label} <span class="pill-count">${pill.count}</span>
            </button>
        `;
    }).join("");

    const options = categories.map(function (category) {
        return '<option value="' + category.name + '">' + category.name + '</option>';
    }).join("");

    categoryFilter.innerHTML = '<option value="all">All</option>' + options;
}

// show the category image for the hovered row
function previewCategory(index) {
    categoryPreview.querySelectorAll("img").forEach(function (image) {
        image.classList.toggle("is-active", Number(image.dataset.index) === index);
    });
    categoryGrid.querySelectorAll(".category-card").forEach(function (card) {
        card.classList.toggle("is-preview", Number(card.dataset.index) === index);
    });
    const label = document.getElementById("previewName");
    if (label && categories[index]) {
        label.textContent = categories[index].name;
    }
}

// show featured products
function renderFeatured() {
    const featured = products.filter(function (product) {
        return product.featured;
    }).slice(0, FEATURED_LIMIT);

    renderProductList(featured, featuredGrid, "star", "No featured products yet.");
}

// show deals (biggest discounts first)
function renderDeals() {
    const deals = products.filter(function (product) {
        return product.discount > 0;
    }).sort(function (a, b) {
        return b.discount - a.discount;
    }).slice(0, DEALS_LIMIT);

    renderProductList(deals, dealsGrid, "star", "No deals right now.", { variant: "deal" });
}

// show recently viewed products (the section stays hidden until there is one)
function renderRecent() {
    const recent = recentlyViewed.map(function (id) {
        return getProductById(id);
    }).filter(function (product) {
        return product !== undefined;
    });

    recentSection.hidden = recent.length === 0;
    renderProductList(recent, recentGrid, "eye", "You haven't viewed any products yet.");
}

// store numbers for the about section (calculated from the product data)
function renderAboutStats() {
    const averageRating = products.reduce(function (sum, product) {
        return sum + product.rating;
    }, 0) / products.length;

    const stats = [
        { value: String(products.length), label: "Products in the range, each one chosen on purpose" },
        { value: String(categories.length), label: "Departments, from laptops to cables" },
        { value: averageRating.toFixed(1), label: "Average customer rating across the store" },
        { value: "RM" + FREE_SHIPPING_LIMIT, label: "Spend for free delivery anywhere in Malaysia" }
    ];

    aboutStats.innerHTML = stats.map(function (stat) {
        return '<div class="about-stat reveal"><dt>' + stat.label + '</dt><dd>' + stat.value + '</dd></div>';
    }).join("");
}


/* search, filter and sort */

// search products by name or category
function searchProducts(list) {
    if (filters.search === "") {
        return list;
    }

    return list.filter(function (product) {
        return product.name.toLowerCase().includes(filters.search) ||
            product.category.toLowerCase().includes(filters.search);
    });
}

// filter products by category, price, rating and stock
function filterProducts(list) {
    return list.filter(function (product) {
        const price = getSalePrice(product);

        if (filters.category !== "all" && product.category !== filters.category) {
            return false;
        }

        if (filters.price === "under100" && price >= 100) {
            return false;
        }
        if (filters.price === "100-300" && (price < 100 || price > 300)) {
            return false;
        }
        if (filters.price === "300-1000" && (price <= 300 || price > 1000)) {
            return false;
        }
        if (filters.price === "above1000" && price <= 1000) {
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

// sort products
function sortProducts(list) {
    const sorted = [...list];

    if (filters.sort === "price-low") {
        sorted.sort(function (a, b) {
            return getSalePrice(a) - getSalePrice(b);
        });
    } else if (filters.sort === "price-high") {
        sorted.sort(function (a, b) {
            return getSalePrice(b) - getSalePrice(a);
        });
    } else if (filters.sort === "rating") {
        sorted.sort(function (a, b) {
            return b.rating - a.rating;
        });
    } else if (filters.sort === "name") {
        sorted.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    } else {
        // featured products first, then by id
        sorted.sort(function (a, b) {
            return Number(b.featured) - Number(a.featured) || a.id - b.id;
        });
    }

    return sorted;
}

// show the shop products
// animateFrom: index of the first card that should animate in (-1 for none)
function renderShop(animateFrom) {
    let result = searchProducts(products);
    result = filterProducts(result);
    result = sortProducts(result);

    const shown = result.slice(0, visibleCount);

    // matching products out of the whole range (paging is shown under the grid)
    resultsCount.textContent = result.length === products.length
        ? "All " + products.length + " products"
        : result.length + " of " + products.length + " products match";
    renderProductList(shown, productGrid, "search", "No products found. Try a different search or clear the filters.", {
        animateFrom: animateFrom === undefined ? -1 : animateFrom
    });

    // show more button with progress
    loadMore.hidden = result.length <= visibleCount;
    loadMoreText.textContent = "Viewing " + shown.length + " of " + result.length;
    loadMoreBar.style.width = (result.length ? (shown.length / result.length) * 100 : 0) + "%";

    updateActiveCategory();
    renderActiveFilters();
}

// re-render the shop after a filter change (back to the first page)
function applyFilters() {
    visibleCount = PAGE_SIZE;
    renderShop(0);
}

// highlight the category that matches the category filter
function updateActiveCategory() {
    categoryGrid.querySelectorAll(".category-card").forEach(function (card) {
        const isActive = card.dataset.category === filters.category;
        card.classList.toggle("active", isActive);
        card.setAttribute("aria-pressed", isActive);
    });

    categoryPills.querySelectorAll(".pill").forEach(function (pill) {
        pill.setAttribute("aria-pressed", pill.dataset.category === filters.category);
    });
}

// text of the selected option of a select
function getSelectedText(select) {
    return select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "";
}

// removable chips for every active filter
function renderActiveFilters() {
    const chips = [];

    if (filters.search !== "") {
        chips.push({ key: "search", label: "“" + searchInput.value.trim() + "”" });
    }
    if (filters.category !== "all") {
        chips.push({ key: "category", label: filters.category });
    }
    if (filters.price !== "all") {
        chips.push({ key: "price", label: getSelectedText(priceFilter) });
    }
    if (filters.rating !== "all") {
        chips.push({ key: "rating", label: getSelectedText(ratingFilter) });
    }
    if (filters.availability !== "all") {
        chips.push({ key: "availability", label: getSelectedText(availabilityFilter) });
    }

    activeFilters.innerHTML = chips.map(function (chip) {
        return '<button class="chip" data-action="remove-filter" data-filter="' + chip.key + '" aria-label="Remove filter ' + chip.label + '">' +
            chip.label + icon("close") + '</button>';
    }).join("");

    // count for the mobile filters button (search has its own field)
    const panelFilters = chips.filter(function (chip) {
        return chip.key !== "search";
    }).length;
    filterCount.textContent = panelFilters;
    filterCount.hidden = panelFilters === 0;
}

// reset one filter from its chip
function removeFilter(key) {
    if (key === "search") {
        filters.search = "";
        searchInput.value = "";
    } else if (key === "category") {
        filters.category = "all";
        categoryFilter.value = "all";
    } else if (key === "price") {
        filters.price = "all";
        priceFilter.value = "all";
    } else if (key === "rating") {
        filters.rating = "all";
        ratingFilter.value = "all";
    } else if (key === "availability") {
        filters.availability = "all";
        availabilityFilter.value = "all";
    }

    applyFilters();
}

// reset all filters and show the products again
function clearFilters() {
    resetFilterValues();
    applyFilters();
}

// set every filter (and its input) back to the default value
function resetFilterValues() {
    filters.search = "";
    filters.category = "all";
    filters.price = "all";
    filters.rating = "all";
    filters.availability = "all";
    filters.sort = "featured";

    searchInput.value = "";
    categoryFilter.value = "all";
    priceFilter.value = "all";
    ratingFilter.value = "all";
    availabilityFilter.value = "all";
    sortSelect.value = "featured";
}

// go to the shop and show one category
function showCategory(categoryName) {
    resetFilterValues();
    filters.category = categoryName;
    categoryFilter.value = categoryName;
    applyFilters();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}


/* cart */

// add a product to the cart (returns true when it worked)
function addToCart(id, quantity) {
    const product = getProductById(id);

    if (!product || product.stock === 0) {
        showToast("This product is out of stock");
        return false;
    }

    const item = cart.find(function (cartItem) {
        return cartItem.id === id;
    });
    const currentQuantity = item ? item.quantity : 0;

    // do not allow more than the stock
    if (currentQuantity + quantity > product.stock) {
        showToast("Only " + product.stock + " in stock");
        return false;
    }

    if (item) {
        item.quantity += quantity;
    } else {
        cart.push({ id: id, quantity: quantity });
    }

    orderSuccess.hidden = true;
    saveCart();
    updateCart();
    bumpBag();
    // no "view bag" link when the bag is already open
    const bagOpen = cartDrawer.classList.contains("open");
    showToast(product.name + " added to your bag", bagOpen ? null : { label: "View bag", action: "open-cart" });
    return true;
}

// small "added" confirmation on the button that was pressed
function confirmButton(button) {
    if (!button || !button.classList.contains("quick-add")) {
        return;
    }

    const label = button.querySelector(".quick-add-label");
    const oldText = label.textContent;

    button.classList.add("added");
    label.textContent = "Added";
    setTimeout(function () {
        button.classList.remove("added");
        label.textContent = oldText;
    }, 1400);
}

// animate the bag count in the header
function bumpBag() {
    const bag = cartCount.closest(".bag-btn");
    bag.classList.remove("bump");
    void bag.offsetWidth;
    bag.classList.add("bump");
}

// remove a product from the cart
function removeFromCart(id) {
    cart = cart.filter(function (item) {
        return item.id !== id;
    });

    saveCart();
    updateCart();
    showToast("Product removed from cart");
}

// change quantity by +1 or -1
function changeQuantity(id, change) {
    const item = cart.find(function (cartItem) {
        return cartItem.id === id;
    });
    const product = getProductById(id);

    if (!item || !product) {
        return;
    }

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        removeFromCart(id);
        return;
    }

    if (newQuantity > product.stock) {
        showToast("Only " + product.stock + " in stock");
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCart();
}

// remove everything from the cart
function clearCart() {
    cart = [];
    saveCart();
    updateCart();
    showToast("Cart cleared");
}

// calculate subtotal, shipping and total
function getCartTotals() {
    const subtotal = cart.reduce(function (sum, item) {
        const product = getProductById(item.id);
        return sum + getSalePrice(product) * item.quantity;
    }, 0);

    const itemCount = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    let shipping = 0;
    if (cart.length > 0 && subtotal < FREE_SHIPPING_LIMIT) {
        shipping = SHIPPING_FEE;
    }

    return {
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping,
        itemCount: itemCount
    };
}

// one item inside the cart drawer
function createCartItem(item) {
    const product = getProductById(item.id);
    const price = getSalePrice(product);

    return `
        <li class="cart-item">
            <div class="cart-thumb">${getImageHtml(product.image, product.name)}</div>
            <div class="cart-item-info">
                <h3 class="cart-item-name">${product.name}</h3>
                <p class="cart-item-price">${formatPrice(price)} each</p>
                <div class="qty-control">
                    <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity of ${product.name}">
                        ${icon("minus")}
                    </button>
                    <span aria-label="Quantity">${item.quantity}</span>
                    <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity of ${product.name}">
                        ${icon("plus")}
                    </button>
                </div>
            </div>
            <div class="cart-item-right">
                <span class="cart-item-subtotal">${formatPrice(price * item.quantity)}</span>
                <button class="remove-btn" data-action="remove-from-cart" data-id="${product.id}" aria-label="Remove ${product.name} from cart">
                    Remove
                </button>
            </div>
        </li>
    `;
}

// one line in the checkout summary
function createCheckoutItem(item) {
    const product = getProductById(item.id);
    const price = getSalePrice(product);

    return `
        <li class="summary-item">
            <div class="summary-thumb">
                ${getImageHtml(product.image, "")}
                <span class="summary-qty" aria-hidden="true">${item.quantity}</span>
            </div>
            <span class="summary-name">${product.name} × ${item.quantity}
                <span class="summary-unit">${formatPrice(price)} each</span>
            </span>
            <span class="price">${formatPrice(price * item.quantity)}</span>
        </li>
    `;
}

// show shipping as text
function formatShipping(totals) {
    if (cart.length > 0 && totals.shipping === 0) {
        return "Free";
    }
    return formatPrice(totals.shipping);
}

// free shipping message with a progress bar
function getShipProgressHtml(totals) {
    if (cart.length === 0) {
        return "";
    }

    const progress = Math.min(totals.subtotal / FREE_SHIPPING_LIMIT, 1);
    let message;

    if (totals.subtotal >= FREE_SHIPPING_LIMIT) {
        message = "<strong>You got free shipping!</strong>";
    } else {
        const remaining = FREE_SHIPPING_LIMIT - totals.subtotal;
        message = "Add <strong>" + formatPrice(remaining) + "</strong> more for free shipping";
    }

    return '<p>' + message + '</p><div class="ship-bar" aria-hidden="true"><span style="transform:scaleX(' + progress + ')"></span></div>';
}

// update everything related to the cart
function updateCart() {
    const totals = getCartTotals();

    cartCount.textContent = totals.itemCount;
    cartCount.hidden = totals.itemCount === 0;
    cartDrawerCount.textContent = totals.itemCount > 0 ? "(" + totals.itemCount + ")" : "";
    checkoutSection.classList.toggle("is-empty", cart.length === 0);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <li class="empty-state">
                ${icon("bag")}
                <h3>Your bag is empty.</h3>
                <p>Your cart is empty. Start with our editor's selection.</p>
                <a href="#featured" class="btn btn-outline" data-action="close-drawer">Continue shopping</a>
            </li>
        `;
        checkoutItems.innerHTML = '<li class="empty-note">Your cart is empty.</li>';
        cartFooter.hidden = true;
    } else {
        cartItems.innerHTML = cart.map(createCartItem).join("");
        checkoutItems.innerHTML = cart.map(createCheckoutItem).join("");
        cartFooter.hidden = false;
    }

    // free shipping message
    const progressHtml = getShipProgressHtml(totals);
    shippingNote.innerHTML = progressHtml;
    shippingNote.classList.toggle("is-free", totals.subtotal >= FREE_SHIPPING_LIMIT);
    checkoutShipProgress.innerHTML = progressHtml;
    checkoutShipProgress.classList.toggle("is-free", totals.subtotal >= FREE_SHIPPING_LIMIT);

    cartSubtotal.textContent = formatPrice(totals.subtotal);
    cartShipping.textContent = formatShipping(totals);
    cartTotal.textContent = formatPrice(totals.total);

    checkoutSubtotal.textContent = formatPrice(totals.subtotal);
    checkoutShipping.textContent = formatShipping(totals);
    checkoutTotal.textContent = formatPrice(totals.total);
    placeOrderTotal.textContent = cart.length > 0 ? formatPrice(totals.total) : "";
}


/* wishlist */

// add or remove a product from the wishlist
function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(function (itemId) {
            return itemId !== id;
        });
        showToast("Removed from wishlist");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist", { label: "View wishlist", action: "open-wishlist" });
    }

    saveWishlist();
    renderAll();
    updateModalWishlistButton();
    renderRelated();

    // small pop on the heart that was pressed
    document.querySelectorAll('.wishlist-btn.active[data-id="' + id + '"]').forEach(function (button) {
        button.classList.add("pop");
    });
}

// show wishlist drawer items
function renderWishlist() {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.hidden = wishlist.length === 0;

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <li class="empty-state">
                ${icon("heart")}
                <h3>Nothing saved yet.</h3>
                <p>You haven't added anything to your wishlist yet.</p>
                <a href="#shop" class="btn btn-outline" data-action="close-drawer">Browse products</a>
            </li>
        `;
        return;
    }

    wishlistItems.innerHTML = wishlist.map(function (id) {
        const product = getProductById(id);
        const outOfStock = product.stock === 0;

        return `
            <li class="cart-item">
                <div class="cart-thumb">${getImageHtml(product.image, product.name)}</div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${product.name}</h3>
                    <div class="price-row">${getPriceHtml(product)}</div>
                    <button class="btn btn-primary btn-small" data-action="add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                        ${outOfStock ? "Out of stock" : "Add to bag"}
                    </button>
                </div>
                <div class="cart-item-right">
                    <span></span>
                    <button class="remove-btn" data-action="toggle-wishlist" data-id="${product.id}" aria-label="Remove ${product.name} from wishlist">
                        Remove
                    </button>
                </div>
            </li>
        `;
    }).join("");
}


/* product details modal */

// build the modal content
function renderModal(product) {
    const salePrice = getSalePrice(product);
    const inWishlist = wishlist.includes(product.id);
    const outOfStock = product.stock === 0;

    let oldPriceHtml = "";
    let saveHtml = "";
    if (product.discount > 0) {
        oldPriceHtml = '<span class="old-price"><span class="visually-hidden">was </span>' + formatPrice(product.price) + '</span>' +
            '<span class="badge badge-inline">' + getDealLabel(product) + '</span>';
        saveHtml = '<p class="save-text">You save ' + formatPrice(product.price - salePrice) + '</p>';
    }

    const shippingText = salePrice >= FREE_SHIPPING_LIMIT
        ? "This product ships free."
        : "Free on orders " + formatPrice(FREE_SHIPPING_LIMIT) + " and above, otherwise a flat " + formatPrice(SHIPPING_FEE) + ".";

    // inline so css can hide the vertical line when the section is open
    const toggleIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12h13"/><path class="icon-plus-v" d="M12 5.5v13"/></svg>';

    modalContent.innerHTML = `
        <div class="modal-gallery">
            <button class="zoom-frame" data-action="toggle-zoom" aria-pressed="false" aria-label="Zoom product image">
                ${getImageHtml(product.image, product.name, true)}
                <span class="zoom-hint">${icon("zoom")}<span class="zoom-hint-desktop">Click to zoom</span><span class="zoom-hint-touch">Tap to zoom</span></span>
            </button>
        </div>
        <div class="modal-details">
            <p class="modal-breadcrumb"><span>Shop</span><span aria-hidden="true">/</span><span class="product-category">${product.category}</span></p>
            <h2 class="modal-title" id="modalTitle">${product.name}</h2>
            <div class="rating">
                <span class="rating-stars" aria-hidden="true">${getStarsHtml(product.rating)}</span>
                <span class="rating-number">${product.rating.toFixed(1)} rating</span>
            </div>
            <div class="modal-price">
                <div class="price-row">
                    <span class="price ${product.discount > 0 ? "is-sale" : ""}">${formatPrice(salePrice)}</span>
                    ${oldPriceHtml}
                </div>
                ${saveHtml}
            </div>
            <p class="modal-description">${product.description}</p>
            ${getStockHtml(product)}
            <div class="modal-buy">
                <div class="modal-quantity" ${outOfStock ? "hidden" : ""}>
                    <span class="visually-hidden" id="modalQtyLabel">Quantity</span>
                    <div class="qty-control qty-large" role="group" aria-labelledby="modalQtyLabel">
                        <button data-action="modal-decrease" aria-label="Decrease quantity">${icon("minus")}</button>
                        <span id="modalQty" aria-live="polite">1</span>
                        <button data-action="modal-increase" aria-label="Increase quantity">${icon("plus")}</button>
                    </div>
                </div>
                <div class="modal-buy-row">
                    <button class="btn btn-primary btn-large" data-action="modal-add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                        ${outOfStock ? "Out of stock" : "Add to bag &mdash; " + formatPrice(salePrice)}
                    </button>
                    <button class="btn btn-outline btn-large modal-wishlist ${inWishlist ? "active" : ""}" id="modalWishlistBtn" data-action="toggle-wishlist" data-id="${product.id}" aria-pressed="${inWishlist}">
                        ${getModalWishlistHtml(inWishlist)}
                    </button>
                </div>
            </div>
            <div class="modal-info">
                <details open>
                    <summary>Delivery ${toggleIcon}</summary>
                    <div><ul>
                        <li>${icon("truck")}<span>${shippingText}</span></li>
                    </ul></div>
                </details>
                <details>
                    <summary>Returns and warranty ${toggleIcon}</summary>
                    <div><ul>
                        <li>${icon("return")}<span>Changed your mind? Return within 14 days.</span></li>
                        <li>${icon("shield")}<span>Every product comes with a simple 1 year warranty.</span></li>
                    </ul></div>
                </details>
            </div>
        </div>
        <div class="modal-related" id="modalRelated"></div>
        <div class="mobile-buy-bar">
            <span class="price">${formatPrice(salePrice)}</span>
            <button class="btn btn-primary" data-action="modal-add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                ${outOfStock ? "Out of stock" : "Add to bag"}
            </button>
        </div>
    `;

    renderRelated();
}

// "more like this" inside the product modal
function renderRelated() {
    const container = document.getElementById("modalRelated");
    const product = getProductById(currentProductId);

    if (!container || !product) {
        return;
    }

    let related = getProductsInCategory(product.category).filter(function (item) {
        return item.id !== product.id;
    });
    let title = "More in " + product.category;

    // not enough in this category, so fill with featured products
    if (related.length < 2) {
        related = related.concat(products.filter(function (item) {
            return item.featured && item.id !== product.id && !related.includes(item);
        }));
        title = "You may also like";
    }

    related = related.slice(0, RELATED_LIMIT);

    container.innerHTML = '<h3>' + title + '</h3><div class="product-grid related-grid" id="relatedGrid">' +
        related.map(function (item) {
            return createProductCard(item);
        }).join("") + '</div>';
}

function getModalWishlistHtml(inWishlist) {
    if (inWishlist) {
        return icon("heart") + '<span class="visually-hidden">Remove from wishlist</span>';
    }
    return icon("heart") + '<span class="visually-hidden">Add to wishlist</span>';
}

// keep the modal wishlist button in sync
function updateModalWishlistButton() {
    const button = document.getElementById("modalWishlistBtn");

    if (!button || productModal.hidden || currentProductId === null) {
        return;
    }

    const inWishlist = wishlist.includes(currentProductId);
    button.innerHTML = getModalWishlistHtml(inWishlist);
    button.classList.toggle("active", inWishlist);
    button.setAttribute("aria-pressed", inWishlist);
}

// open the product modal
function showProductDetails(id) {
    const product = getProductById(id);

    if (!product) {
        return;
    }

    currentProductId = id;
    modalQuantity = 1;

    if (getOpenDialog() === null) {
        openerFocus = getFocusInfo();
    }

    closeMenu();
    addToRecentlyViewed(id);
    renderModal(product);

    productModal.hidden = false;
    productModal.querySelector(".modal-box").scrollTop = 0;
    updateBodyScroll();
    productModal.querySelector(".modal-close").focus();
}

// close the product modal
function closeModal() {
    if (productModal.hidden) {
        return;
    }

    productModal.hidden = true;
    currentProductId = null;
    updateBodyScroll();
    restoreFocus(openerFocus);
    openerFocus = null;
}

// change quantity inside the modal
function changeModalQuantity(change) {
    const product = getProductById(currentProductId);

    if (!product) {
        return;
    }

    const newQuantity = modalQuantity + change;

    if (newQuantity < 1 || newQuantity > product.stock) {
        return;
    }

    modalQuantity = newQuantity;
    document.getElementById("modalQty").textContent = modalQuantity;
}

// zoom the product image (click or tap), and follow the pointer while zoomed
function toggleZoom(frame, event) {
    const zoomed = !frame.classList.contains("is-zoomed");

    if (zoomed) {
        moveZoom(frame, event);
    }

    frame.classList.toggle("is-zoomed", zoomed);
    frame.setAttribute("aria-pressed", zoomed);
}

function moveZoom(frame, event) {
    // keyboard clicks have no pointer position, so zoom into the center
    if (!event || event.detail === 0 || event.clientX === undefined) {
        frame.style.setProperty("--zx", "50%");
        frame.style.setProperty("--zy", "50%");
        return;
    }

    const box = frame.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1);
    frame.style.setProperty("--zx", (x * 100) + "%");
    frame.style.setProperty("--zy", (y * 100) + "%");
}


/* recently viewed */

function addToRecentlyViewed(id) {
    // remove the id if it already exists, then put it first
    recentlyViewed = recentlyViewed.filter(function (itemId) {
        return itemId !== id;
    });
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, RECENT_LIMIT);

    saveRecentlyViewed();
    renderRecent();
}


/* drawers */

function openDrawer(drawer) {
    if (getOpenDialog() === null) {
        openerFocus = getFocusInfo();
    }

    closeMenu();
    hideDrawers();
    drawer.classList.add("open");
    overlay.classList.add("show");
    updateBodyScroll();
    drawer.querySelector(".drawer-close").focus();
}

// close the drawers and send focus back to the button that opened them
function closeDrawers() {
    const wasOpen = overlay.classList.contains("show");

    hideDrawers();

    if (wasOpen) {
        restoreFocus(openerFocus);
        openerFocus = null;
    }
}

function hideDrawers() {
    cartDrawer.classList.remove("open");
    wishlistDrawer.classList.remove("open");
    filterPanel.classList.remove("open");
    overlay.classList.remove("show");
    updateBodyScroll();
}

// stop page scrolling while a drawer, the modal or the mobile menu is open
function updateBodyScroll() {
    const somethingOpen = overlay.classList.contains("show") || !productModal.hidden || navLinks.classList.contains("open");
    document.body.classList.toggle("no-scroll", somethingOpen);
}


/* checkout */

function getFieldValue(fieldId) {
    return document.getElementById(fieldId).value.trim();
}

// show or clear an error message for a field
function setError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "Error");

    if (!input || !error) {
        return;
    }

    error.textContent = message;
    input.classList.toggle("input-error", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

// check one field and show an error if needed
function checkField(fieldId, isValid, message) {
    setError(fieldId, isValid ? "" : message);
    return isValid;
}

// validate the whole checkout form
function validateCheckoutForm() {
    const email = getFieldValue("email");
    const phone = getFieldValue("phone");
    const postcode = getFieldValue("postcode");

    // malaysian numbers: 0123456789, 012-345 6789, +60123456789, 03-1234 5678
    const phoneDigits = phone.replace(/[\s-]/g, "");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^(\+?60|0)[1-9][0-9]{7,9}$/;
    const postcodePattern = /^[0-9]{5}$/;

    const results = [
        checkField("fullName", getFieldValue("fullName").length >= 2, "Please enter your full name"),
        checkField("email", emailPattern.test(email), "Please enter a valid email address"),
        checkField("phone", phonePattern.test(phoneDigits), "Please enter a valid Malaysian phone number, e.g. 012-345 6789"),
        checkField("address", getFieldValue("address") !== "", "Please enter your address"),
        checkField("city", getFieldValue("city") !== "", "Please enter your city"),
        checkField("state", getFieldValue("state") !== "", "Please select your state"),
        checkField("postcode", postcodePattern.test(postcode), "Postcode must be 5 digits")
    ];

    const isValid = !results.includes(false);

    // focus the first field with an error
    if (!isValid) {
        const firstError = checkoutForm.querySelector(".input-error");
        if (firstError) {
            firstError.focus();
        }
    }

    return isValid;
}

// place the order
function handleCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }

    if (!validateCheckoutForm()) {
        showToast("Please fix the errors in the form");
        return;
    }

    const totals = getCartTotals();
    const customerName = getFieldValue("fullName");
    const customerEmail = getFieldValue("email");
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const orderNumber = "HAZ-" + Date.now().toString().slice(-6);

    // clear the cart and the form
    cart = [];
    saveCart();
    updateCart();
    checkoutForm.reset();

    // fill the confirmation (textContent keeps user input safe)
    orderTitle.textContent = "Thank you, " + customerName + ".";
    orderMessage.textContent = "Thank you, " + customerName + "! Your order " + orderNumber +
        " (" + formatPrice(totals.total) + ", " + paymentMethod + ") is being prepared. In a real store, a confirmation would be sent to " + customerEmail + ".";

    orderMeta.innerHTML = "";
    [["Order", orderNumber], ["Total", formatPrice(totals.total)], ["Payment", paymentMethod]].forEach(function (pair) {
        const wrap = document.createElement("div");
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = pair[0];
        detail.textContent = pair[1];
        wrap.append(term, detail);
        orderMeta.appendChild(wrap);
    });

    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
    orderSuccess.focus({ preventScroll: true });

    showToast("Order placed successfully");
}


/* theme */

function getTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeButtons() {
    const nextLabel = getTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode";

    document.querySelectorAll('[data-action="toggle-theme"]').forEach(function (button) {
        const label = button.querySelector(".theme-label");
        if (label) {
            label.textContent = getTheme() === "dark" ? "Light mode" : "Dark mode";
        } else {
            button.setAttribute("aria-label", nextLabel);
        }
    });
}

function toggleTheme() {
    const root = document.documentElement;
    const next = getTheme() === "dark" ? "light" : "dark";

    // smooth color change for a moment, then remove it so other animations stay fast
    root.classList.add("theme-transition");
    root.dataset.theme = next;
    setTimeout(function () {
        root.classList.remove("theme-transition");
    }, 400);

    try {
        localStorage.setItem(THEME_KEY, next);
    } catch (error) {
        // theme still works for this visit
    }

    updateThemeButtons();
}


/* scroll reveal */

let revealObserver = null;

function observeReveals() {
    const items = document.querySelectorAll(".reveal:not(.is-visible)");

    if (!("IntersectionObserver" in window)) {
        items.forEach(function (item) {
            item.classList.add("is-visible");
        });
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }

    items.forEach(function (item) {
        // small stagger between siblings
        const siblings = Array.from(item.parentElement.children).filter(function (child) {
            return child.classList.contains("reveal");
        });
        item.style.setProperty("--delay", Math.min(siblings.indexOf(item), 5) * 80 + "ms");
        revealObserver.observe(item);
    });
}


/* render everything */

function renderAll() {
    renderFeatured();
    renderShop();
    renderDeals();
    renderRecent();
    renderWishlist();
}


/* events */

// handle all button clicks with one listener
document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-action]");

    if (!target) {
        return;
    }

    const action = target.dataset.action;
    const id = Number(target.dataset.id);

    switch (action) {
        case "add-to-cart":
            if (addToCart(id, 1)) {
                confirmButton(target);
            }
            break;
        // these re-render a list, so keepFocus puts keyboard focus back on the same button
        case "remove-from-cart":
            keepFocus(function () {
                removeFromCart(id);
            });
            break;
        case "increase":
            keepFocus(function () {
                changeQuantity(id, 1);
            });
            break;
        case "decrease":
            keepFocus(function () {
                changeQuantity(id, -1);
            });
            break;
        case "clear-cart":
            keepFocus(clearCart);
            break;
        case "toggle-wishlist":
            keepFocus(function () {
                toggleWishlist(id);
            });
            break;
        case "view-product":
            showProductDetails(id);
            break;
        case "filter-category":
            showCategory(target.dataset.category);
            break;
        case "filter-pill":
            filters.category = target.dataset.category;
            categoryFilter.value = target.dataset.category;
            applyFilters();
            break;
        case "remove-filter":
            removeFilter(target.dataset.filter);
            searchInput.focus({ preventScroll: true });
            break;
        case "load-more": {
            const previous = visibleCount;
            visibleCount += PAGE_SIZE;
            renderShop(previous);
            // move keyboard focus to the first new product
            const firstNew = productGrid.children[previous];
            if (firstNew) {
                firstNew.querySelector(".product-name button").focus({ preventScroll: true });
            }
            break;
        }
        case "spotlight":
            setSpotlight(Number(target.dataset.index), true);
            break;
        case "modal-increase":
            changeModalQuantity(1);
            break;
        case "modal-decrease":
            changeModalQuantity(-1);
            break;
        case "modal-add-to-cart":
            addToCart(id, modalQuantity);
            break;
        case "toggle-zoom":
            toggleZoom(target, event);
            break;
        case "close-modal":
            closeModal();
            break;
        case "open-cart":
            if (target.classList.contains("toast-action")) {
                closeModal();
            }
            openDrawer(cartDrawer);
            break;
        case "open-wishlist":
            if (target.classList.contains("toast-action")) {
                closeModal();
            }
            openDrawer(wishlistDrawer);
            break;
        case "open-filters":
            openDrawer(filterPanel);
            break;
        case "close-drawer":
            closeDrawers();
            break;
        case "go-checkout":
            closeDrawers();
            document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
            document.getElementById("fullName").focus({ preventScroll: true });
            break;
        case "open-search":
            closeDrawers();
            closeMenu();
            document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
            searchInput.focus({ preventScroll: true });
            break;
        case "toggle-theme":
            toggleTheme();
            break;
        case "open-profile":
            showToast("Profile page is not built yet");
            break;
        case "coming-soon":
            event.preventDefault();
            showToast("This page is not built yet");
            break;
    }
});

// close the modal when the dark background is clicked
productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
        closeModal();
    }
});

// follow the pointer while the product image is zoomed
modalContent.addEventListener("pointermove", function (event) {
    const frame = event.target.closest(".zoom-frame.is-zoomed");
    if (frame) {
        moveZoom(frame, event);
    }
});

// leaving the image (mouse only) zooms back out
modalContent.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse") {
        const frame = modalContent.querySelector(".zoom-frame.is-zoomed");
        if (frame) {
            toggleZoom(frame);
        }
    }
}, true);

// category index: change the preview image on hover or focus
categoryGrid.addEventListener("pointerover", function (event) {
    const card = event.target.closest(".category-card");
    if (card) {
        previewCategory(Number(card.dataset.index));
    }
});

categoryGrid.addEventListener("focusin", function (event) {
    const card = event.target.closest(".category-card");
    if (card) {
        previewCategory(Number(card.dataset.index));
    }
});

// arrow keys move between the spotlight tabs
spotlightTabs.addEventListener("keydown", function (event) {
    const count = spotlightProducts.length;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSpotlight((spotlightIndex + 1) % count, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSpotlight((spotlightIndex - 1 + count) % count, true);
    }
});

// escape closes the top layer (modal first, then drawer, then mobile menu)
// tab stays inside an open drawer or modal
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (!productModal.hidden) {
            closeModal();
        } else if (overlay.classList.contains("show")) {
            closeDrawers();
        } else if (navLinks.classList.contains("open")) {
            closeMenu();
            menuToggle.focus();
        }
    }

    if (event.key === "Tab") {
        trapFocus(event);
    }
});

// search while typing
searchInput.addEventListener("input", function () {
    filters.search = searchInput.value.trim().toLowerCase();
    visibleCount = PAGE_SIZE;
    renderShop();
});

// filters and sorting
categoryFilter.addEventListener("change", function () {
    filters.category = categoryFilter.value;
    applyFilters();
});

priceFilter.addEventListener("change", function () {
    filters.price = priceFilter.value;
    applyFilters();
});

ratingFilter.addEventListener("change", function () {
    filters.rating = ratingFilter.value;
    applyFilters();
});

availabilityFilter.addEventListener("change", function () {
    filters.availability = availabilityFilter.value;
    applyFilters();
});

sortSelect.addEventListener("change", function () {
    filters.sort = sortSelect.value;
    applyFilters();
});

clearFiltersBtn.addEventListener("click", clearFilters);

// checkout form
checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleCheckout();
});

// remove the error while the user types
checkoutForm.addEventListener("input", function (event) {
    if (event.target.id) {
        setError(event.target.id, "");
    }
});

// mobile menu
function setMenuOpen(isOpen) {
    if (isOpen) {
        // the panel starts right under the header (the announcement bar may still be visible)
        navLinks.style.setProperty("--nav-top", header.getBoundingClientRect().bottom + "px");
    }

    navLinks.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
    // only swap the icon reference, so the clicked element stays in the page
    menuToggle.querySelector("use").setAttribute("href", isOpen ? "#i-close" : "#i-menu");
    updateBodyScroll();
}

function closeMenu() {
    if (navLinks.classList.contains("open")) {
        setMenuOpen(false);
    }
}

menuToggle.addEventListener("click", function () {
    setMenuOpen(!navLinks.classList.contains("open"));
});

navLinks.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
        closeMenu();
    }
});

// close the mobile menu when clicking outside the header
document.addEventListener("click", function (event) {
    if (navLinks.classList.contains("open") && !event.target.closest(".header")) {
        closeMenu();
    }
});

// header border once the page scrolls
function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateHeader, { passive: true });

// leaving the mobile layout closes the menu and the filter sheet
window.matchMedia("(min-width: 1025px)").addEventListener("change", function (query) {
    if (query.matches && filterPanel.classList.contains("open")) {
        closeDrawers();
    }
});

window.matchMedia("(min-width: 901px)").addEventListener("change", function (query) {
    if (query.matches) {
        closeMenu();
    }
});


/* start the app */
document.documentElement.classList.add("js");
spotlightProducts = pickSpotlightProducts();
renderSpotlightTabs();
renderSpotlight(false);
renderCategories();
renderAboutStats();
renderAll();
updateCart();
updateThemeButtons();
updateHeader();
observeReveals();
