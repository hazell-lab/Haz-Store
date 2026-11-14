# Haz Store redesign: audit, identity and report

This is a redesign of the existing Haz Store frontend, not a rebuild. It keeps the same architecture: one HTML page, one stylesheet, two plain JavaScript files, no framework and no build step. All product data, cart logic, storage keys, validation rules and routing (in-page anchors) are kept.

Screenshots referred to below are in this folder:

- `before/`: the original site (desktop 1440, mobile 390)
- `after/`: the redesign in the light theme (desktop 1440, tablet 820, mobile 390)
- `after-dark/`: the redesign in the dark theme
- `compare-desktop.jpg`, `compare-mobile.jpg`, `compare-product.jpg`: side-by-side before and after

All screenshots were taken from the site running locally in headless Chrome.

---

## 1. What was there (inspection)

| Area | Found |
|---|---|
| Stack | Static HTML5, CSS3, vanilla ES6. Google Fonts (Inter) and Font Awesome 6 from a CDN. No package manager, no backend. |
| Structure | A single page (`index.html`) with anchored sections: hero, categories, featured, shop, deals, recently viewed, checkout, about, footer. |
| Data | `js/products.js`: 7 categories and 20 products (id, name, category, price, discount %, rating, stock, image, description, featured). |
| Product detail | A modal with one image, rating, price, stock, a quantity stepper, add to cart and wishlist. |
| Cart | A drawer. Add, remove, plus/minus, clear, RM10 shipping (free from RM300), saved to `localStorage`, checked against stock on load. |
| Checkout | A frontend-only demo form with validation (Malaysian phone, 5-digit postcode). There is **no payment integration and no backend**. On success it shows a message and empties the cart. |
| Accounts | None. The profile icon shows a "not built yet" toast. There is no order history, contact page or login. |
| Other | Search, filters (category, price, rating, availability), sorting, wishlist, recently viewed, toasts, a good keyboard and focus implementation, and reduced-motion support. |

---

## 2. Design audit

### Problems in the original

1. **Wrong product photos (data bug).** 18 of the 20 image files did not match their products. For example, "Aero Slim Laptop 14" showed a phone, "Nova Phone X" showed a smartwatch and "Keystone Mechanical Keyboard" showed headphones (see `before/desktop-full.jpg`). Nothing damages trust in a store faster.
2. **Generic template look.** Inter on grey with a stock blue accent (#2563eb), rounded white cards with soft shadows, and a gradient hero that held an *icon of headphones* instead of a product. It looked like a default UI kit, not a retailer.
3. **Weak product presentation.** Every photo sat on pure white inside a white card, so the products did not stand out. The images were small, and the same 4-column card grid was used for featured items, the shop, deals and recently viewed.
4. **Repetitive page rhythm.** Every section was "heading, subtitle, grid of identical cards".
5. **Noisy cards.** Each card had a full-width blue "Add to cart" button, a stock count ("15 in stock") and five star icons. Twenty identical blue buttons competed with the products.
6. **Icon-tile categories.** Seven identical rounded tiles with Font Awesome glyphs. They looked like an admin dashboard.
7. **Checkout always visible.** The full form showed even with an empty cart, and the summary said "Your cart is empty" right next to it.
8. **Mobile header truncated** the logo to "Haz", and the mobile menu was a plain dropdown.
9. **Inconsistent buttons and type.** There were several button styles, a badge style per state and ad-hoc font sizes, with no spacing scale.
10. **Heavy icon dependency.** All of Font Awesome (CSS plus webfonts) was loaded for about 25 icons.

### What was preserved

- The whole JavaScript architecture: one delegated click handler with `data-action`, `keepFocus` and `restoreFocus`, focus trapping, Escape layering and storage helpers.
- All business logic: sale price maths, shipping rules, stock limits, cart cleaning, the filter, search and sort algorithms, and form validation with the same regexes and messages.
- The `localStorage` keys (`HazStoreCart`, `HazStoreWishlist`, `HazStoreRecent`), so saved carts and wishlists survive the redesign.
- Product data and categories, unchanged (only the image *files* were renamed to match their ids).
- All section ids and anchors (`#shop`, `#deals`, `#checkout` …), the README's "image number = product id" rule, and the honest "fictional store" and "demo checkout" notices.
- The accessibility features that already worked: labels, `aria-invalid`, live regions, focus return and reduced motion.

### What was redesigned

The visual layer and the composition: tokens, typography, every component, every section layout, the product modal, the drawers, the checkout layout, mobile navigation, filters on mobile, and motion.

---

## 3. Brand identity

> **Superseded.** The serif, warm paper and vermilion identity below has been replaced by a bold grotesk, black and white and signal yellow identity. See [`../reskin/RESKIN.md`](../reskin/RESKIN.md). The layout, component and behaviour notes in the rest of this file still apply.

**Concept: "Technology, edited."** The real catalogue is small: 20 products in 7 departments. Instead of hiding that behind a mass-market template, the identity presents it as a *curated* store, like an editor's selection of tools. Every visual choice supports that idea.

| | Decision | Why |
|---|---|---|
| Colour | Warm paper `#f3f0ea`, ink `#161513`, product "plates" `#e7e2d8`, and one signal accent, vermilion `#b93a16`. Dark theme: `#131210` with light plates. | The products are mostly black, white and silver hardware. A warm neutral ground makes them read as objects. Vermilion is used only for sale prices, discounts and one word in the headline, so it always means something. There are no blues or purples, and no gradients. |
| Type | **Instrument Serif** for display, **Geist** for text and UI, **Geist Mono** for labels, indexes, prices in lists and counts. | The serif-and-grotesk contrast gives an editorial voice. The mono "spec sheet" labels tie it back to electronics. The pairing is distinctive without being decorative. |
| Product presentation | Every photo sits on a tinted plate (`mix-blend-mode: multiply` removes the white JPEG backgrounds) at a 4:5 portrait ratio, with generous padding. | It is consistent and gallery-like, and it makes 20 differently shot supplier photos look like one shoot. |
| Shape | 3–6px radii, 1px hairlines, almost no shadows (only on floating layers). | Calm and precise. It avoids the "rounded card" look. |
| Layout | Numbered editorial sections (`01 Departments`, `02 Editor's selection` …), split headers, and a different composition per section. | It gives the page a rhythm and a sense of authorship. |
| Motion | One easing curve (`cubic-bezier(.2,.7,.2,1)`), 150/280/600ms durations, slow image scale on hover, staggered reveals, sheet-style modal. | Quiet and physical. Everything is disabled under `prefers-reduced-motion`. |

### Cross-project independence

I did not have access to your portfolio or productivity projects, so I have **not** compared against them. This identity was built only from this store's products and content. To keep it distinct, check that the other two projects do not also use Instrument Serif, Geist, warm paper backgrounds or a vermilion accent.

---

## 4. Page-by-page changes

**Header and navigation.** There is a thin ink announcement bar with the real store policies (free delivery over RM300, 14-day returns, 1-year warranty). The header is sticky and gains a hairline once you scroll. The serif "Haz." wordmark has a vermilion dot. The text "Bag" button shows its count and bumps when items are added. A light/dark toggle was added. On phones the menu is a full-screen panel with large serif links, and "Account" and the theme toggle move into it.

**Hero.** The icon placeholder is replaced by real products. There is a large serif headline, one primary CTA and a secondary text link. A "spotlight" lets you pick between three featured products from different departments (tabs with arrow-key support, no autoplay). The selected product is shown large on a plate with an index number, name, description, price and "View product".

**Promises strip.** The four real store promises, set as a quiet ruled strip.

**Categories.** A typographic index replaces the icon tiles: large serif department names with counts. Hovering or focusing a name swaps a large product preview on the right. On phones each row gets a small product thumbnail instead.

**Editor's selection.** An asymmetric grid: one large feature (2×2) plus four products.

**Shop (product listing).**
- Category pills with counts. They stay in sync with the category select and with the index above.
- A toolbar with search and sort, and a sticky filter sidebar on desktop. On tablet and phone the filters become a bottom sheet with a count badge and "Show results".
- Removable chips for every active filter, and an honest result count ("6 of 20 products match").
- Paging: 9 products per page (8 on phones so the 2-column grid never leaves an orphan), with a "Viewing 9 of 20" progress bar and "Show more products". Keyboard focus moves to the first new product.
- Cards show category, a compact rating, name and price (sale prices in vermilion, with the old price struck through). Stock only appears when it matters ("Only 4 left", "Sold out"). On hover, the image scales slowly and a wishlist heart and an "Add to bag" bar appear. On touch devices these are always visible as compact buttons.

**Offers.** A dark band with its own composition: large serif discount numerals on each plate. On phones it becomes a swipeable rail.

**About.** A large editorial statement, plus four figures *calculated from the real data* (product count, department count, average rating, free-delivery threshold). It keeps the "fictional store" disclosure.

**Recently viewed.** Hidden until something has been viewed, then shown as a compact row.

**Product detail (modal).** Now a large two-column sheet: a big plate image with click or tap zoom that follows the pointer, a breadcrumb, a large serif title, stars, the price with "You save RMx", a stock dot, a large quantity stepper, "Add to bag — RMx", a wishlist toggle, and Delivery and Returns accordions (real policies only). Below that, "More in {category}" recommendations. On phones it is full-screen with a sticky price and add-to-bag bar.

**Cart drawer.** A free-shipping progress bar, large thumbnails, steppers, a text "Remove" link, a clear total, a full-width checkout button and a quiet "Clear bag" link. The empty state has a heading and a route back to the selection. "Added to your bag" toasts have a "View bag" action.

**Checkout.** Three numbered steps (contact, delivery, payment) and payment tiles with icons. "Place order" shows the live total. A sticky summary has thumbnails, quantity badges, the shipping progress and return and warranty notes. On phones the summary comes first. With an empty cart, the form is replaced by a short empty state. After an order, a confirmation panel shows the order number, total and payment method, and receives focus.

**Footer.** A large closing statement, a CTA, link columns (social links are now text) and a currency note.

---

## 5. Additions (clearly new, not in the original)

These use only existing data and front-end state. No fake functionality was invented.

- A light/dark theme, saved as `HazStoreTheme` and following the system setting by default.
- Paging with "Show more" in the shop.
- Active filter chips and category pills.
- The hero product spotlight.
- Image zoom in the product modal.
- Related products in the product modal (same category, falling back to featured).
- A free-shipping progress bar.
- About figures calculated from the product data.
- Toast actions ("View bag", "View wishlist").
- An image loading state (the plate shimmers, then the photo fades in).

**Not added, because the project does not support them:** accounts, login, order history, contact or support pages, a real payment gateway, product variants (size/colour) and multiple images per product. The "Account" button and footer support links still show the original "not built yet" toast.

---

## 6. Files

**Modified**
- `index.html`: new markup, an inline SVG icon sprite (Font Awesome removed), new fonts, theme bootstrap, ARIA improvements, and `?v=2` on the CSS and JS links so returning visitors don't mix cached old files with new ones.
- `css/style.css`: rewritten as a token-based design system (light and dark tokens, type and spacing scales, components, motion, breakpoints at 1200/1024/900/768/600/400).
- `js/script.js`: the same logic, with new rendering and these additions: `icon()`, spotlight, category index and pills, chips, paging, related products, zoom, theme, reveal observer, and a ship-progress bar.
- `assets/images/product-*.jpg`: 18 files renamed so each image matches its product id. **Pixel content is unchanged.**
- `README.md`: updated technologies and features.
- `docs/screenshot.png`: the new storefront screenshot.

**Unchanged:** `js/products.js` and `LICENSE`.

**Added**
- `docs/redesign/`: this report, plus before, after and dark screenshots and comparisons.
- `.claude/launch.json`: local preview config (`python -m http.server 5173`). Optional, and not needed to run the site.

---

## 7. Testing

The site was run locally (`python -m http.server`) and driven with headless Chrome (Playwright).

- **Functional regression: 72 of 72 checks pass.** They cover:
  - paging; pills, chips, the price filter, clear and sort; search, including the empty state; category index to shop
  - spotlight click and arrow keys
  - modal: open, focus and trap, quantity, zoom, add, related swap, Escape
  - stock limit; sold-out disabled
  - cart totals, shipping fee and free threshold, quantity and focus retention, remove; Escape and focus return
  - wishlist count, `aria-pressed`, drawer and persistence
  - checkout: all 7 errors, focus on the first error, `aria-invalid`, error cleared on typing, live order total, success, cart cleared in storage, form hidden after the order
  - theme persistence across reloads
  - mobile: no horizontal overflow, menu open and close, filter sheet with count badge, 42px touch add button, sticky buy bar
- **Accessibility:** axe-core (WCAG 2 A/AA and best practices) reports **0 violations** in both themes. Measured contrast for every text token pair is ≥ 4.5:1. The large decorative discount numerals are 3.47:1 (large text, `aria-hidden`).
- **Console and network:** no errors, no failed requests, no 404s, and every visible image loads.
- **Visual review:** screenshots were reviewed at 1440, 820 and 390 widths in light and dark themes for the home page, shop, product, cart and checkout. Issues found and fixed during review:
  - a duplicated filter header on desktop
  - an oversized hero plate
  - misaligned form fields when one error wrapped
  - the accordion icon reading as "close"
  - four stars showing for a 4.7 rating
  - the mobile menu closing immediately (a real bug)
  - spotlight tabs losing keyboard focus
  - toasts covering the mobile checkout button
  - an orphan card on mobile pages
  - announcement text wrapping on phones
- **Build:** there is no build step; `node --check js/script.js` passes.

---

## 8. Remaining issues

1. **Photography is the biggest limit.** The source images are 375–678px supplier shots in mixed styles. They look soft at the hero and product sizes on high-DPI screens. Real photography at 1600px or more on a consistent background (ideally WebP/AVIF with `srcset`) would lift the whole site more than any code change.
2. Each product has one image, so the product page "gallery" is one image plus zoom.
3. Checkout is still a frontend demo, as it was. There is no payment or backend to preserve or connect.
4. It was tested in Chrome and Chrome mobile emulation only. Safari, Firefox and real iOS/Android devices were not tested. `:has()` (image shimmer only) and `color-mix()` (focus glow only) degrade gracefully.
5. Google Fonts is still a third-party request (now three families instead of Inter plus Font Awesome).
6. Lighthouse was not run (axe was used for accessibility).
7. These screenshots add about 7 MB to the repository. Delete `docs/redesign/after-dark` or the full-page shots if size matters.
8. The live Netlify site is not updated until these changes are committed and deployed.
