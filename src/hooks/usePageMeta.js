import { useEffect } from "react";

const BASE_TITLE = "Haz Store";

// page title for each route (screen readers announce it on navigation)
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? title + " | " + BASE_TITLE : BASE_TITLE + " | Technology, edited";
  }, [title]);
}
