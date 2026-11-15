import { useState } from "react";

const placeholderSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f0f0f0"/><text x="200" y="210" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#636363">No image</text></svg>';
export const PLACEHOLDER_IMAGE = "data:image/svg+xml," + encodeURIComponent(placeholderSvg);

// product photo that fades in once loaded and falls back to a placeholder
export function ProductImage({ src, alt, eager = false, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={[className, loaded ? "is-loaded" : ""].filter(Boolean).join(" ") || undefined}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!failed) {
          setFailed(true);
        }
      }}
    />
  );
}
