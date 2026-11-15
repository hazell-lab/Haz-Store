import { useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { ProductImage } from "./ProductImage.jsx";

// product photo with click or tap to zoom, the zoom follows the pointer
// (the catalog has one photo per product, so there are no thumbnails to switch between)
export function ProductGallery({ product }) {
  const [zoomed, setZoomed] = useState(false);
  const frameRef = useRef(null);

  function moveZoom(event) {
    const frame = frameRef.current;
    if (!frame) return;
    // keyboard clicks have no pointer position, so zoom into the center
    if (!event || event.detail === 0 || event.clientX === undefined) {
      frame.style.setProperty("--zx", "50%");
      frame.style.setProperty("--zy", "50%");
      return;
    }
    const box = frame.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1);
    frame.style.setProperty("--zx", x * 100 + "%");
    frame.style.setProperty("--zy", y * 100 + "%");
  }

  return (
    <div className="modal-gallery pdp-gallery">
      <button
        ref={frameRef}
        type="button"
        className={"zoom-frame" + (zoomed ? " is-zoomed" : "")}
        aria-pressed={zoomed}
        aria-label={"Zoom image of " + product.name}
        onClick={(event) => {
          if (!zoomed) moveZoom(event);
          setZoomed(!zoomed);
        }}
        onPointerMove={(event) => zoomed && moveZoom(event)}
        onPointerLeave={(event) => event.pointerType === "mouse" && setZoomed(false)}
      >
        <ProductImage src={product.image} alt={product.name} eager />
        <span className="zoom-hint">
          <Icon name="zoom" />
          <span className="zoom-hint-desktop">Click to zoom</span>
          <span className="zoom-hint-touch">Tap to zoom</span>
        </span>
      </button>
    </div>
  );
}
