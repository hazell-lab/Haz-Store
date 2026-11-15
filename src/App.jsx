import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";
import HomePage from "./pages/HomePage.jsx";

// the home page loads with the app, other pages load when first visited
const ShopPage = lazy(() => import("./pages/ShopPage.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const WishlistPage = lazy(() => import("./pages/WishlistPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// providers in one place so tests can reuse them with a memory router
export function AppProviders({ children, initialCatalog, fetcher }) {
  return (
    <ToastProvider>
      <CatalogProvider initialCatalog={initialCatalog} fetcher={fetcher}>
        <StoreProvider>
          <UIProvider>{children}</UIProvider>
        </StoreProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
