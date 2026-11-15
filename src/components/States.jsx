import { Icon } from "./Icon.jsx";

// friendly message when a list has nothing to show
// headingLevel keeps the heading order right on each page
export function EmptyState({ icon = "search", title, children, action, as: Tag = "div", headingLevel = 3 }) {
  const Heading = "h" + headingLevel;
  return (
    <Tag className="empty-state">
      <Icon name={icon} />
      {title && <Heading>{title}</Heading>}
      {children && <p>{children}</p>}
      {action}
    </Tag>
  );
}

// skeleton cards while the catalog loads
export function LoadingState({ count = 4, label = "Loading products" }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-media" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
        ))}
      </div>
    </div>
  );
}

// shown when the catalog could not be loaded, with a retry button
export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <h2>Products could not be loaded.</h2>
      <p>{message || "Something went wrong while loading the catalog."} Check your connection and try again.</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
