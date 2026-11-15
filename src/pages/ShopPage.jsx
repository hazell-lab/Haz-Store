import { useEffect, useRef, useState } from "react";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { ActiveFilters, CategoryPills, FilterPanel, SortControl } from "../components/FilterPanel.jsx";
import { Icon } from "../components/Icon.jsx";
import { ProductGrid } from "../components/ProductGrid.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { usePageSize } from "../hooks/useMediaQuery.js";
import { usePageTitle } from "../hooks/usePageMeta.js";
import { useProductFilters } from "../hooks/useProductFilters.js";

function ShopResults() {
  const { products, categories } = useCatalog();
  const { openPanel, closePanel } = useUI();
  const { filters, results, chips, panelCount, setFilter, clearFilter, clearAll } = useProductFilters(products, categories);
  const pageSize = usePageSize();
  const [visible, setVisible] = useState(pageSize);
  const [animateFrom, setAnimateFrom] = useState(-1);
  const gridRef = useRef(null);
  const searchRef = useRef(null);
  const filterKey = JSON.stringify(filters);

  // any filter change goes back to the first page
  useEffect(() => {
    setVisible(pageSize);
    setAnimateFrom(0);
  }, [filterKey, pageSize]);

  // leaving the mobile layout closes the filter sheet
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1025px)");
    const onChange = (event) => event.matches && closePanel();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [closePanel]);

  const shown = results.slice(0, visible);
  const total = products.length;
  const countText =
    results.length === total ? "All " + total + " products" : results.length + " of " + total + " products match";

  function showMore() {
    const previous = visible;
    setAnimateFrom(previous);
    setVisible(previous + pageSize);
    // move keyboard focus to the first new product
    requestAnimationFrame(() => {
      const card = gridRef.current?.querySelectorAll(".product-card")[previous];
      card?.querySelector(".product-name a")?.focus({ preventScroll: true });
    });
  }

  function removeChip(key) {
    clearFilter(key);
    searchRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <CategoryPills categories={categories} products={products} value={filters.category} onChange={(value) => setFilter("category", value)} />

      <div className="shop-toolbar">
        <div className="search-box">
          <label htmlFor="searchInput" className="visually-hidden">
            Search products
          </label>
          <Icon name="search" />
          <input
            ref={searchRef}
            type="search"
            id="searchInput"
            className="form-control"
            placeholder="Search by product name or category"
            autoComplete="off"
            value={filters.q}
            onChange={(event) => setFilter("q", event.target.value)}
          />
        </div>
        <button type="button" className="btn btn-outline filter-toggle" onClick={() => openPanel("filters")} aria-controls="filterPanel">
          <Icon name="filter" /> Filters
          {panelCount > 0 && <span className="filter-count">{panelCount}</span>}
        </button>
        <SortControl value={filters.sort} onChange={(value) => setFilter("sort", value)} />
      </div>

      <div className="shop-layout">
        <FilterPanel filters={filters} categories={categories} onChange={setFilter} onClear={clearAll} resultCount={results.length} />

        <div className="shop-results">
          <h2 className="visually-hidden">Products</h2>
          <div className="results-bar">
            <p className="results-count" aria-live="polite" data-testid="results-count">
              {countText}
            </p>
            <ActiveFilters chips={chips} onRemove={removeChip} onClearAll={clearAll} />
          </div>
          <div ref={gridRef}>
            <ProductGrid
              products={shown}
              className="shop-grid"
              animateFrom={animateFrom}
              emptyMessage="No products found. Try a different search or clear the filters."
            />
          </div>
          {results.length === 0 && chips.length > 0 && (
            <div className="shop-empty-actions">
              <button type="button" className="btn btn-outline" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          )}
          {results.length > visible && (
            <div className="load-more">
              <p className="load-more-text">
                Viewing {shown.length} of {results.length}
              </p>
              <div className="load-more-bar" aria-hidden="true">
                <span style={{ width: (shown.length / results.length) * 100 + "%" }} />
              </div>
              <button type="button" className="btn btn-outline" onClick={showMore}>
                Show more products
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  usePageTitle("Shop all products");

  return (
    <section className="section shop-page" id="shop" aria-labelledby="shopTitle">
      <div className="container">
        <header className="section-header section-header-split">
          <div>
            <p className="kicker">The collection</p>
            <h1 className="section-title" id="shopTitle">
              Shop all products
            </h1>
          </div>
          <p className="section-subtitle">Search, filter and sort to find what you need. Filters are saved in the link, so you can share them.</p>
        </header>
        <CatalogGate skeletons={8}>
          <ShopResults />
        </CatalogGate>
      </div>
    </section>
  );
}
