import { useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import { formatPrice } from "../utils/format.js";
import { getSearchSuggestions } from "../utils/filters.js";
import { getSalePrice } from "../utils/pricing.js";
import { Icon } from "./Icon.jsx";

// header search with product suggestions (a combobox that follows the aria pattern)
// enter opens the shop with the search, picking a suggestion opens that product
export function SearchBar({ onDone, autoFocus = false }) {
  const { products } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef(null);

  const suggestions = useMemo(() => getSearchSuggestions(products, query), [products, query]);
  const showList = query.trim() !== "";

  function finish(path) {
    setQuery("");
    setActive(-1);
    navigate(path);
    if (onDone) onDone();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (active >= 0 && suggestions[active]) {
      finish("/product/" + suggestions[active].id);
      return;
    }
    const term = query.trim();
    finish(term ? "/shop?q=" + encodeURIComponent(term) : "/shop");
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setActive((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Escape" && query) {
      // first escape clears the field, the next one closes the panel
      event.stopPropagation();
      setQuery("");
      setActive(-1);
    }
  }

  return (
    <form className="site-search" role="search" onSubmit={handleSubmit}>
      <div className="search-box">
        <label htmlFor={listId + "-input"} className="visually-hidden">
          Search products
        </label>
        <Icon name="search" />
        <input
          ref={inputRef}
          id={listId + "-input"}
          type="search"
          className="form-control"
          placeholder="Search products or categories"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? listId + "-" + active : undefined}
        />
      </div>
      {showList && (
        <ul className="search-suggestions" id={listId} role="listbox" aria-label="Suggestions">
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              id={listId + "-" + index}
              role="option"
              aria-selected={index === active}
              className={index === active ? "is-active" : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => finish("/product/" + product.id)}
            >
              <span className="suggestion-name">{product.name}</span>
              <span className="suggestion-meta">
                {product.category} · {formatPrice(getSalePrice(product))}
              </span>
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="suggestion-empty" role="option" aria-selected="false" aria-disabled="true">
              No products match &ldquo;{query.trim()}&rdquo;
            </li>
          )}
          {suggestions.length > 0 && (
            <li
              role="option"
              aria-selected="false"
              className="suggestion-all"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => finish("/shop?q=" + encodeURIComponent(query.trim()))}
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </form>
  );
}
