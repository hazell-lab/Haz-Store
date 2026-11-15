import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { CartDrawer } from "./CartDrawer.jsx";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";
import { IconSprite } from "./Icon.jsx";
import { LoadingState } from "./States.jsx";
import { Toasts } from "./Toasts.jsx";

// scroll to the top (or to #section) after each navigation, and move focus for screen readers
function useRouteFocus() {
  const location = useLocation();
  const { status } = useCatalog();
  const lastPath = useRef(null);

  useEffect(() => {
    const isFirst = lastPath.current === null;
    const pathChanged = lastPath.current !== location.pathname;
    lastPath.current = location.pathname;

    if (location.hash) {
      // wait a frame so the section exists (the home page renders after the data loads)
      const frame = requestAnimationFrame(() => {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) {
          target.scrollIntoView({ behavior: isFirst ? "auto" : "smooth" });
        }
      });
      return () => cancelAnimationFrame(frame);
    }

    // filter changes only touch the query string, so focus stays where it is
    if (!pathChanged) {
      return undefined;
    }
    window.scrollTo(0, 0);
    if (isFirst) {
      return undefined;
    }
    // focus the page heading so keyboard and screen reader users start at the new content
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector("main h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, status]);
}

export function Layout() {
  const location = useLocation();
  const { status } = useCatalog();
  const { panel, closePanel } = useUI();

  useRouteFocus();
  useReveal([location.pathname, status]);

  // a page change closes any open panel
  useEffect(() => {
    closePanel();
  }, [location.pathname, closePanel]);

  return (
    <>
      <IconSprite />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announce" role="region" aria-label="Store announcements">
        <p className="container announce-inner">
          <span>
            Free delivery<span className="announce-long"> on orders</span> over RM300
          </span>
          <span className="announce-sep" aria-hidden="true">/</span>
          <span>14-day returns</span>
          <span className="announce-sep hide-sm" aria-hidden="true">/</span>
          <span className="hide-sm">1-year warranty on everything</span>
        </p>
      </div>
      <Header />
      <main id="main">
        <Suspense
          fallback={
            <div className="container page-pad">
              <LoadingState label="Loading page" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <div className={"overlay" + (panel ? " show" : "")} onClick={closePanel} aria-hidden="true" />
      <CartDrawer />
      <Toasts />
    </>
  );
}
