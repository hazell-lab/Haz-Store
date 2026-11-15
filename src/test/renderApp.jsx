import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import catalogJson from "../../public/data/products.json";
import { AppProviders, AppRoutes } from "../App.jsx";
import { normalizeCatalog } from "../services/catalogService.js";

// the real catalog, so tests use the same data as the site
export const catalog = normalizeCatalog(catalogJson);

// shows the current url so tests can check navigation and filter params
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

// render the whole app at a route; pass fetcher to test loading and errors
export function renderApp(route = "/", { fetcher, withCatalog = true } = {}) {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders initialCatalog={withCatalog && !fetcher ? catalog : undefined} fetcher={fetcher}>
        <AppRoutes />
        <LocationProbe />
      </AppProviders>
    </MemoryRouter>
  );
  return { user, ...utils };
}

export function productById(id) {
  return catalog.products.find((product) => product.id === id);
}
