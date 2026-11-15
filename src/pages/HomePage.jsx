import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { Icon } from "../components/Icon.jsx";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { ProductImage } from "../components/ProductImage.jsx";
import { SpotlightStage, SpotlightTabs, useSpotlight } from "../components/Spotlight.jsx";
import {
  DEALS_LIMIT,
  FEATURED_LIMIT,
  FREE_SHIPPING_LIMIT,
  SPOTLIGHT_LIMIT,
  TOP_RATED_LIMIT,
} from "../config.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { usePageTitle } from "../hooks/usePageMeta.js";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed.js";
import {
  getCategoryCover,
  getDeals,
  getFeatured,
  getProductsInCategory,
  getStoreStats,
  getTopRated,
  pickSpotlight,
} from "../utils/catalog.js";
import { pad } from "../utils/format.js";

function SectionHeader({ kicker, title, id, subtitle, split = true }) {
  return (
    <header className={"section-header reveal" + (split ? " section-header-split" : "")}>
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 className="section-title" id={id}>
          {title}
        </h2>
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  );
}

function Hero({ products }) {
  const spotlightProducts = useMemo(() => pickSpotlight(products, SPOTLIGHT_LIMIT), [products]);
  const spotlight = useSpotlight(spotlightProducts);

  return (
    <section className="hero" id="home" aria-labelledby="heroTitle">
      <div className="container hero-inner">
        <div className="hero-text">
          <p className="kicker reveal">The Haz Edit &mdash; a small range, chosen carefully</p>
          <h1 className="hero-title reveal" id="heroTitle">
            Technology, edited.
          </h1>
          <p className="hero-lead reveal">
            A small, considered range of laptops, phones, audio and desk essentials. Fewer things, chosen better, priced fairly.
          </p>
          <div className="hero-buttons reveal">
            <Link to="/shop" className="btn btn-primary btn-large">
              Shop the collection <Icon name="arrow" />
            </Link>
            <Link to="/#deals" className="btn-link">
              See current offers
            </Link>
          </div>
          {spotlightProducts.length > 0 && <SpotlightTabs spotlight={spotlight} />}
        </div>
        {spotlightProducts.length > 0 && <SpotlightStage spotlight={spotlight} />}
      </div>
    </section>
  );
}

function Promises() {
  const items = [
    { icon: "truck", strong: "Free delivery", text: " on orders RM300 and above" },
    { icon: "shield", strong: "1-year warranty", text: " on every product" },
    { icon: "return", strong: "Easy returns", text: " within 14 days" },
    { icon: "support", strong: "Friendly support", text: " every day" },
  ];
  return (
    <section className="promises" aria-label="Store promises">
      <ul className="container promise-list">
        {items.map((item) => (
          <li key={item.icon}>
            <Icon name={item.icon} />
            <span>
              <strong>{item.strong}</strong>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// category list with a large preview image that follows hover and focus
function Categories({ products, categories }) {
  const [preview, setPreview] = useState(0);

  return (
    <div className="category-index">
      <ul className="category-list">
        {categories.map((category, index) => {
          const cover = getCategoryCover(products, category.name);
          const count = getProductsInCategory(products, category.name).length;
          return (
            <li key={category.name}>
              <Link
                className={"category-card" + (preview === index ? " is-preview" : "")}
                to={"/shop?category=" + encodeURIComponent(category.name)}
                onPointerEnter={() => setPreview(index)}
                onFocus={() => setPreview(index)}
              >
                <span className="category-num">{pad(index + 1)}</span>
                <span className="category-thumb" aria-hidden="true">
                  {cover && <ProductImage src={cover.image} alt="" />}
                </span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">
                  {count} <span className="visually-hidden">products</span>
                </span>
                <Icon name="arrow" />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="category-preview" aria-hidden="true">
        {categories.map((category, index) => {
          const cover = getCategoryCover(products, category.name);
          return cover ? (
            <img key={category.name} src={cover.image} alt="" loading="lazy" decoding="async" className={index === preview ? "is-active" : undefined} />
          ) : null;
        })}
        <div className="category-preview-label">
          <span>{categories[preview] ? categories[preview].name : ""}</span>
          <span>Shop now</span>
        </div>
      </div>
    </div>
  );
}

function AboutStats({ products, categories }) {
  const stats = getStoreStats(products, categories);
  // every number comes from the product data or the store rules, nothing is made up
  const items = [
    { value: String(stats.productCount), label: "Products in the range, each one chosen on purpose" },
    { value: String(stats.categoryCount), label: "Departments, from laptops to cables" },
    { value: stats.averageRating.toFixed(1), label: "Average product rating across the store" },
    { value: "RM" + FREE_SHIPPING_LIMIT, label: "Spend for free delivery anywhere in Malaysia" },
  ];
  return (
    <dl className="about-stats">
      {items.map((item) => (
        <div className="about-stat" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function HomePage() {
  usePageTitle("");
  const { status, products, categories } = useCatalog();
  const { items: recent } = useRecentlyViewed();
  const ready = status === "ready";

  return (
    <>
      <Hero products={ready ? products : []} />
      <Promises />

      <section className="section" id="categories" aria-labelledby="categoriesTitle">
        <div className="container">
          <SectionHeader
            kicker="Departments"
            title="Shop by category"
            id="categoriesTitle"
            subtitle="Pick a department to jump straight into the filtered collection."
            split={false}
          />
          <CatalogGate skeletons={4}>
            <Categories products={products} categories={categories} />
          </CatalogGate>
        </div>
      </section>

      <section className="section section-alt" id="featured" aria-labelledby="featuredTitle">
        <div className="container">
          <SectionHeader
            kicker="Editor's selection"
            title="Chosen for the long run."
            id="featuredTitle"
            subtitle={"Our favorite picks this season — the products we would buy again."}
          />
          <CatalogGate skeletons={4}>
            <ProductGrid
              products={getFeatured(products, FEATURED_LIMIT)}
              className="featured-grid"
              emptyIcon="star"
              emptyMessage="No featured products yet."
            />
          </CatalogGate>
        </div>
      </section>

      <section className="section section-ink" id="deals" aria-labelledby="dealsTitle">
        <div className="container">
          <SectionHeader
            kicker="Offers"
            title="Fewer deals, better ones."
            id="dealsTitle"
            subtitle="The biggest discounts right now, on products we already rate."
          />
          <CatalogGate skeletons={4}>
            <ProductGrid products={getDeals(products, DEALS_LIMIT)} className="deals-grid" variant="deal" emptyIcon="star" emptyMessage="No deals right now." />
          </CatalogGate>
        </div>
      </section>

      <section className="section" id="top-rated" aria-labelledby="topRatedTitle">
        <div className="container">
          <SectionHeader
            kicker="Top rated"
            title="Highest rated, in stock."
            id="topRatedTitle"
            subtitle="Sorted by product rating. Only products you can order today."
          />
          <CatalogGate skeletons={4}>
            <ProductGrid products={getTopRated(products, TOP_RATED_LIMIT)} emptyIcon="star" emptyMessage="No rated products yet." />
          </CatalogGate>
          <div className="section-more">
            <Link to="/shop?sort=rating" className="btn btn-outline">
              See all by rating <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="about" aria-labelledby="aboutTitle">
        <div className="container about-inner">
          <p className="kicker reveal">About Haz Store</p>
          <h2 className="about-statement reveal" id="aboutTitle">
            We stock fewer products, explain them plainly and price them fairly &mdash; so choosing tech feels less like homework.
          </h2>
          {ready && <AboutStats products={products} categories={categories} />}
          <p className="about-note reveal">
            Haz Store is a fictional shop made for a frontend portfolio project. Products, prices and stock are sample data,
            and no real orders, payments or deliveries take place.
          </p>
        </div>
      </section>

      {ready && recent.length > 0 && (
        <section className="section section-tight" id="recent" aria-labelledby="recentTitle">
          <div className="container">
            <header className="section-header section-header-split">
              <h2 className="section-title section-title-small" id="recentTitle">
                Recently viewed
              </h2>
              <p className="section-subtitle">Products you opened recently.</p>
            </header>
            <ProductGrid products={recent} className="recent-grid" emptyIcon="eye" emptyMessage="You haven't viewed any products yet." />
          </div>
        </section>
      )}
    </>
  );
}
