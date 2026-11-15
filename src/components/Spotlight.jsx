import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, pad } from "../utils/format.js";
import { getSalePrice } from "../utils/pricing.js";
import { PriceDisplay } from "./PriceDisplay.jsx";
import { ProductImage } from "./ProductImage.jsx";

// hero product picker state, shared by the tabs (in the hero text) and the stage
export function useSpotlight(products) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const tabRefs = useRef([]);

  function select(next, moveFocus) {
    if (next === index || !products[next]) {
      return;
    }
    setIndex(next);
    setAnimate(true);
    if (moveFocus) {
      tabRefs.current[next]?.focus();
    }
  }

  return { products, index, animate, select, tabRefs, product: products[index] };
}

// arrow keys move between tabs (aria tabs pattern)
export function SpotlightTabs({ spotlight }) {
  const { products, index, select, tabRefs } = spotlight;

  function handleKeyDown(event) {
    const count = products.length;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select((index + 1) % count, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select((index - 1 + count) % count, true);
    }
  }

  return (
    <div className="spotlight-tabs" role="tablist" aria-label="Spotlight products" onKeyDown={handleKeyDown}>
      {products.map((item, itemIndex) => {
        const selected = itemIndex === index;
        return (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[itemIndex] = node;
            }}
            type="button"
            className="spotlight-tab"
            role="tab"
            id={"spotlightTab" + itemIndex}
            aria-controls="spotlightPanel"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(itemIndex, false)}
          >
            <span className="spotlight-num">{pad(itemIndex + 1)}</span>
            <span className="spotlight-name">{item.name}</span>
            <span className="spotlight-price">{formatPrice(getSalePrice(item))}</span>
          </button>
        );
      })}
    </div>
  );
}

// the selected product, large
export function SpotlightStage({ spotlight }) {
  const { product, index, animate } = spotlight;
  if (!product) {
    return null;
  }
  return (
    <div className="hero-stage" role="tabpanel" id="spotlightPanel" aria-labelledby={"spotlightTab" + index}>
      <figure className="hero-figure">
        <div className={"stage-plate" + (animate ? " is-entering" : "")} key={product.id}>
          <div className="stage-meta" aria-hidden="true">
            <span className="stage-index">{pad(index + 1)}</span>
            <span>{product.category}</span>
          </div>
          <ProductImage src={product.image} alt={product.name} eager />
        </div>
        <figcaption className="stage-caption">
          <div>
            <p className="stage-name">{product.name}</p>
            <p className="stage-desc">{product.description}</p>
          </div>
          <div className="stage-buy">
            <PriceDisplay product={product} />
            <Link className="btn btn-outline btn-small" to={"/product/" + product.id}>
              View product
            </Link>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
