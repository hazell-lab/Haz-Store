import { useCatalog } from "../context/CatalogContext.jsx";
import { ErrorState, LoadingState } from "./States.jsx";

// shows loading or error states until the products are ready
// wrapClass puts the loading and error states inside a container (for full pages)
export function CatalogGate({ children, skeletons = 4, wrapClass }) {
  const { status, error, reload } = useCatalog();

  let content = null;
  if (status === "loading") {
    content = <LoadingState count={skeletons} />;
  } else if (status === "error") {
    content = <ErrorState message={error && error.message} onRetry={reload} />;
  } else {
    return children;
  }
  return wrapClass ? <div className={wrapClass}>{content}</div> : content;
}
