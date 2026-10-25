// storage keys
const CART_KEY = "HazStoreCart";
const WISHLIST_KEY = "HazStoreWishlist";
const RECENT_KEY = "HazStoreRecent";

// store settings
const SHIPPING_FEE = 10;
const FREE_SHIPPING_LIMIT = 300;
const RECENT_LIMIT = 4;
const FEATURED_LIMIT = 4;
const DEALS_LIMIT = 4;

// placeholder image used when a product image is missing
const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#eef0f3"/><text x="200" y="210" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#9aa1ab">No image</text></svg>';
const placeholderImage = "data:image/svg+xml," + encodeURIComponent(placeholderSvg);

// page elements
const categoryGrid = document.getElementById("categoryGrid");
const featuredGrid = document.getElementById("featuredGrid");
const productGrid = document.getElementById("productGrid");
const dealsGrid = document.getElementById("dealsGrid");
const recentGrid = document.getElementById("recentGrid");
const resultsCount = document.getElementById("resultsCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const ratingFilter = document.getElementById("ratingFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortSelect = document.getElementById("sortSelect");
const clearFiltersBtn = document.getElementById("clearFilters");

const cartCount = document.getElementById("cartCount");
const wishlistCount = document.getElementById("wishlistCount");
const cartItems = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const shippingNote = document.getElementById("shippingNote");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartShipping = document.getElementById("cartShipping");
const cartTotal = document.getElementById("cartTotal");
const wishlistItems = document.getElementById("wishlistItems");

const checkoutItems = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");
const orderSuccess = document.getElementById("orderSuccess");
const orderMessage = document.getElementById("orderMessage");

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

// modal data
let currentProductId = null;
let modalQuantity = 1;

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

// badge text for discounted products
function getDealLabel(product) {
    if (product.discount >= 25) {
        return "Limited deal";
    }
    return product.discount + "% off";
}

// star icons for a rating
function getStarsHtml(rating) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (rating >= i - 0.5) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }

    return stars;
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

// image tag with a fallback if the file is missing
function getImageHtml(src, alt) {
    return '<img src="' + src + '" alt="' + alt + '" loading="lazy" onerror="this.onerror=null;this.src=placeholderImage">';
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
    return null;
}

// keep the tab key inside the open drawer or modal
function trapFocus(event) {
    const dialog = getOpenDialog();

    if (!dialog) {
        return;
    }

    const focusable = Array.from(dialog.querySelectorAll("button:not([disabled]), a[href], input, select"))
        .filter(function (element) {
            return element.offsetParent !== null;
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

// show a short message
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // hide it after a short time
    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 2500);
}


/* product cards */

function createProductCard(product) {
    const salePrice = getSalePrice(product);
    const inWishlist = wishlist.includes(product.id);
    const outOfStock = product.stock === 0;

    // choose the badge
    let badgeHtml = "";
    if (outOfStock) {
        badgeHtml = '<span class="badge badge-sold">Sold out</span>';
    } else if (product.discount > 0) {
        const badgeClass = product.discount >= 25 ? "badge badge-limited" : "badge";
        badgeHtml = '<span class="' + badgeClass + '">' + getDealLabel(product) + '</span>';
    }

    // show old price only when discounted
    let oldPriceHtml = "";
    if (product.discount > 0) {
        oldPriceHtml = '<span class="old-price">' + formatPrice(product.price) + '</span>';
    }

    return `
        <article class="product-card">
            <div class="product-image-wrap">
                <button class="product-image-button" data-action="view-product" data-id="${product.id}" aria-label="View details for ${product.name}">
                    ${getImageHtml(product.image, product.name)}
                </button>
                ${badgeHtml}
                <button class="wishlist-btn ${inWishlist ? "active" : ""}" data-action="toggle-wishlist" data-id="${product.id}" aria-label="${inWishlist ? "Remove from wishlist" : "Add to wishlist"}" aria-pressed="${inWishlist}">
                    <i class="${inWishlist ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">
                    <button data-action="view-product" data-id="${product.id}">${product.name}</button>
                </h3>
                <div class="rating">
                    <span class="rating-stars" aria-hidden="true">${getStarsHtml(product.rating)}</span>
                    <span class="rating-number">${product.rating.toFixed(1)}</span>
                </div>
                <div class="price-row">
                    <span class="price">${formatPrice(salePrice)}</span>
                    ${oldPriceHtml}
                </div>
                ${getStockHtml(product)}
                <button class="btn btn-primary btn-full" data-action="add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                    <i class="fa-solid fa-cart-plus"></i> ${outOfStock ? "Out of stock" : "Add to cart"}
                </button>
            </div>
        </article>
    `;
}

// show a list of products inside a container
function renderProductList(list, container, emptyIcon, emptyMessage) {
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="${emptyIcon}"></i>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(createProductCard).join("");
}


/* page sections */

// show category cards and fill the category filter
function renderCategories() {
    categoryGrid.innerHTML = categories.map(function (category) {
        return `
            <button class="category-card" data-action="filter-category" data-category="${category.name}">
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            </button>
        `;
    }).join("");

    const options = categories.map(function (category) {
        return '<option value="' + category.name + '">' + category.name + '</option>';
    }).join("");

    categoryFilter.innerHTML = '<option value="all">All</option>' + options;
}

// show featured products
function renderFeatured() {
    const featured = products.filter(function (product) {
        return product.featured;
    }).slice(0, FEATURED_LIMIT);

    renderProductList(featured, featuredGrid, "fa-regular fa-star", "No featured products yet.");
}

// show deals (biggest discounts first)
function renderDeals() {
    const deals = products.filter(function (product) {
        return product.discount > 0;
    }).sort(function (a, b) {
        return b.discount - a.discount;
    }).slice(0, DEALS_LIMIT);

    renderProductList(deals, dealsGrid, "fa-solid fa-tag", "No deals right now.");
}

// show recently viewed products
function renderRecent() {
    const recent = recentlyViewed.map(function (id) {
        return getProductById(id);
    }).filter(function (product) {
        return product !== undefined;
    });

    renderProductList(recent, recentGrid, "fa-regular fa-eye", "You haven't viewed any products yet.");
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
function renderShop() {
    let result = searchProducts(products);
    result = filterProducts(result);
    result = sortProducts(result);

    resultsCount.textContent = "Showing " + result.length + " of " + products.length + " products";
    renderProductList(result, productGrid, "fa-solid fa-magnifying-glass", "No products found.");
    updateActiveCategory();
}

// highlight the category card that matches the category filter
function updateActiveCategory() {
    categoryGrid.querySelectorAll(".category-card").forEach(function (card) {
        const isActive = card.dataset.category === filters.category;
        card.classList.toggle("active", isActive);
        card.setAttribute("aria-pressed", isActive);
    });
}

// reset all filters and show the products again
function clearFilters() {
    resetFilterValues();
    renderShop();
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
    renderShop();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}


/* cart */

// add a product to the cart
function addToCart(id, quantity) {
    const product = getProductById(id);

    if (!product || product.stock === 0) {
        showToast("This product is out of stock");
        return;
    }

    const item = cart.find(function (cartItem) {
        return cartItem.id === id;
    });
    const currentQuantity = item ? item.quantity : 0;

    // do not allow more than the stock
    if (currentQuantity + quantity > product.stock) {
        showToast("Only " + product.stock + " in stock");
        return;
    }

    if (item) {
        item.quantity += quantity;
    } else {
        cart.push({ id: id, quantity: quantity });
    }

    orderSuccess.hidden = true;
    saveCart();
    updateCart();
    showToast("Product added to cart");
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
            ${getImageHtml(product.image, product.name)}
            <div class="cart-item-info">
                <h3 class="cart-item-name">${product.name}</h3>
                <p class="cart-item-price">${formatPrice(price)} each</p>
                <div class="qty-control">
                    <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity of ${product.name}">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity of ${product.name}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-right">
                <span class="cart-item-subtotal">${formatPrice(price * item.quantity)}</span>
                <button class="remove-btn" data-action="remove-from-cart" data-id="${product.id}" aria-label="Remove ${product.name} from cart">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        </li>
    `;
}

// one line in the checkout summary
function createCheckoutItem(item) {
    const product = getProductById(item.id);

    return `
        <li class="summary-item">
            <span>${product.name} × ${item.quantity}</span>
            <span>${formatPrice(getSalePrice(product) * item.quantity)}</span>
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

// update everything related to the cart
function updateCart() {
    const totals = getCartTotals();

    cartCount.textContent = totals.itemCount;
    cartCount.hidden = totals.itemCount === 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <li class="empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your cart is empty.</p>
                <button class="btn btn-outline" data-action="close-drawer">Continue shopping</button>
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
    if (totals.subtotal >= FREE_SHIPPING_LIMIT) {
        shippingNote.textContent = "You got free shipping!";
    } else {
        const remaining = FREE_SHIPPING_LIMIT - totals.subtotal;
        shippingNote.textContent = "Add " + formatPrice(remaining) + " more for free shipping";
    }

    cartSubtotal.textContent = formatPrice(totals.subtotal);
    cartShipping.textContent = formatShipping(totals);
    cartTotal.textContent = formatPrice(totals.total);

    checkoutSubtotal.textContent = formatPrice(totals.subtotal);
    checkoutShipping.textContent = formatShipping(totals);
    checkoutTotal.textContent = formatPrice(totals.total);
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
        showToast("Added to wishlist");
    }

    saveWishlist();
    renderAll();
    updateModalWishlistButton();
}

// show wishlist drawer items
function renderWishlist() {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.hidden = wishlist.length === 0;

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <li class="empty-state">
                <i class="fa-regular fa-heart"></i>
                <p>You haven't added anything to your wishlist yet.</p>
                <button class="btn btn-outline" data-action="close-drawer">Browse products</button>
            </li>
        `;
        return;
    }

    wishlistItems.innerHTML = wishlist.map(function (id) {
        const product = getProductById(id);
        const outOfStock = product.stock === 0;

        return `
            <li class="cart-item">
                ${getImageHtml(product.image, product.name)}
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${product.name}</h3>
                    <p class="cart-item-price">${formatPrice(getSalePrice(product))}</p>
                    <button class="btn btn-primary btn-small" data-action="add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                        ${outOfStock ? "Out of stock" : "Add to cart"}
                    </button>
                </div>
                <div class="cart-item-right">
                    <span></span>
                    <button class="remove-btn" data-action="toggle-wishlist" data-id="${product.id}" aria-label="Remove ${product.name} from wishlist">
                        <i class="fa-regular fa-trash-can"></i>
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
    if (product.discount > 0) {
        oldPriceHtml = '<span class="old-price">' + formatPrice(product.price) + '</span>' +
            '<span class="badge badge-inline">' + getDealLabel(product) + '</span>';
    }

    modalContent.innerHTML = `
        <div class="modal-image">
            ${getImageHtml(product.image, product.name)}
        </div>
        <div class="modal-details">
            <span class="product-category">${product.category}</span>
            <h2 class="modal-title" id="modalTitle">${product.name}</h2>
            <div class="rating">
                <span class="rating-stars" aria-hidden="true">${getStarsHtml(product.rating)}</span>
                <span class="rating-number">${product.rating.toFixed(1)} rating</span>
            </div>
            <div class="price-row">
                <span class="price">${formatPrice(salePrice)}</span>
                ${oldPriceHtml}
            </div>
            <p class="modal-description">${product.description}</p>
            ${getStockHtml(product)}
            <div class="modal-quantity" ${outOfStock ? "hidden" : ""}>
                <span>Quantity</span>
                <div class="qty-control">
                    <button data-action="modal-decrease" aria-label="Decrease quantity">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span id="modalQty">1</span>
                    <button data-action="modal-increase" aria-label="Increase quantity">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" data-action="modal-add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
                    <i class="fa-solid fa-cart-plus"></i> ${outOfStock ? "Out of stock" : "Add to cart"}
                </button>
                <button class="btn btn-outline" id="modalWishlistBtn" data-action="toggle-wishlist" data-id="${product.id}">
                    ${getModalWishlistHtml(inWishlist)}
                </button>
            </div>
        </div>
    `;
}

function getModalWishlistHtml(inWishlist) {
    if (inWishlist) {
        return '<i class="fa-solid fa-heart"></i> Remove from wishlist';
    }
    return '<i class="fa-regular fa-heart"></i> Add to wishlist';
}

// keep the modal wishlist button in sync
function updateModalWishlistButton() {
    const button = document.getElementById("modalWishlistBtn");

    if (!button || productModal.hidden || currentProductId === null) {
        return;
    }

    button.innerHTML = getModalWishlistHtml(wishlist.includes(currentProductId));
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

    addToRecentlyViewed(id);
    renderModal(product);

    productModal.hidden = false;
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
    overlay.classList.remove("show");
    updateBodyScroll();
}

// stop page scrolling while a drawer or modal is open
function updateBodyScroll() {
    const somethingOpen = overlay.classList.contains("show") || !productModal.hidden;
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
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const orderNumber = "HAZ-" + Date.now().toString().slice(-6);

    // clear the cart and the form
    cart = [];
    saveCart();
    updateCart();
    checkoutForm.reset();

    orderMessage.textContent = "Thank you, " + customerName + "! Your order " + orderNumber +
        " (" + formatPrice(totals.total) + ", " + paymentMethod + ") is being prepared.";
    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({ behavior: "smooth", block: "center" });

    showToast("Order placed successfully");
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
            addToCart(id, 1);
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
        case "modal-increase":
            changeModalQuantity(1);
            break;
        case "modal-decrease":
            changeModalQuantity(-1);
            break;
        case "modal-add-to-cart":
            addToCart(id, modalQuantity);
            break;
        case "close-modal":
            closeModal();
            break;
        case "open-cart":
            openDrawer(cartDrawer);
            break;
        case "open-wishlist":
            openDrawer(wishlistDrawer);
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
            document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
            searchInput.focus({ preventScroll: true });
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
    renderShop();
});

// filters and sorting
categoryFilter.addEventListener("change", function () {
    filters.category = categoryFilter.value;
    renderShop();
});

priceFilter.addEventListener("change", function () {
    filters.price = priceFilter.value;
    renderShop();
});

ratingFilter.addEventListener("change", function () {
    filters.rating = ratingFilter.value;
    renderShop();
});

availabilityFilter.addEventListener("change", function () {
    filters.availability = availabilityFilter.value;
    renderShop();
});

sortSelect.addEventListener("change", function () {
    filters.sort = sortSelect.value;
    renderShop();
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
    navLinks.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.querySelector("i").className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

function closeMenu() {
    setMenuOpen(false);
}

menuToggle.addEventListener("click", function () {
    setMenuOpen(!navLinks.classList.contains("open"));
});

navLinks.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
        closeMenu();
    }
});

// close the mobile menu when clicking outside the header
document.addEventListener("click", function (event) {
    if (navLinks.classList.contains("open") && !event.target.closest(".header")) {
        closeMenu();
    }
});


/* start the app */
renderCategories();
renderAll();
updateCart();