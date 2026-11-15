import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useUI } from "../context/UIContext.jsx";
import { useCart } from "../hooks/useCart.js";
import { useTheme } from "../hooks/useTheme.js";
import { useWishlist } from "../hooks/useWishlist.js";
import { Icon } from "./Icon.jsx";
import { SearchBar } from "./SearchBar.jsx";

export function Logo({ className = "logo" }) {
  return (
    <Link to="/" className={className} aria-label="Haz Store home">
      <span className="logo-word">Haz</span>
      <span className="logo-dot" aria-hidden="true" />
      <span className="logo-sub">Store</span>
    </Link>
  );
}

function ThemeIcons() {
  return (
    <>
      <Icon name="moon" className="icon-theme-light" />
      <Icon name="sun" className="icon-theme-dark" />
    </>
  );
}

// home sections are plain links with a hash, the shop is its own page
const NAV_LINKS = [
  { to: "/shop", label: "Shop", page: true },
  { to: "/#categories", label: "Categories" },
  { to: "/#featured", label: "Selection" },
  { to: "/#deals", label: "Offers" },
  { to: "/#about", label: "About" },
];

export function Header() {
  const { totals } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { panel, openPanel } = useUI();
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const searchButtonRef = useRef(null);
  const previousCount = useRef(totals.itemCount);

  // close the menu and search after navigating
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // border under the header once the page scrolls
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // small bump on the bag count when something is added
  useEffect(() => {
    if (totals.itemCount > previousCount.current) {
      setBump(false);
      const frame = requestAnimationFrame(() => setBump(true));
      previousCount.current = totals.itemCount;
      return () => cancelAnimationFrame(frame);
    }
    previousCount.current = totals.itemCount;
    return undefined;
  }, [totals.itemCount]);

  // mobile menu: escape, outside click and leaving the mobile layout close it
  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    document.body.classList.add("no-scroll");
    const media = window.matchMedia("(min-width: 901px)");
    function onKey(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }
    function onClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function onMedia(event) {
      if (event.matches) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    media.addEventListener("change", onMedia);
    return () => {
      // only release the scroll lock if no panel needs it
      if (!document.querySelector(".drawer.open, .filter-panel.open")) {
        document.body.classList.remove("no-scroll");
      }
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      media.removeEventListener("change", onMedia);
    };
  }, [menuOpen]);

  // search panel: escape closes it and gives focus back
  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        searchButtonRef.current?.focus();
      }
    }
    function onClick(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [searchOpen]);

  function toggleMenu() {
    if (!menuOpen && headerRef.current) {
      // the panel starts right under the header (the announcement bar may still be visible)
      headerRef.current.querySelector(".nav-links").style.setProperty("--nav-top", headerRef.current.getBoundingClientRect().bottom + "px");
    }
    setSearchOpen(false);
    setMenuOpen((open) => !open);
  }

  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const isHashActive = (to) => location.pathname === "/" && location.hash === to.slice(1);

  return (
    <header className={"header" + (scrolled ? " is-scrolled" : "")} id="header" ref={headerRef}>
      <div className="container nav">
        <Logo />

        <nav className={"nav-links" + (menuOpen ? " open" : "")} id="navLinks" aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.page ? (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ) : (
              <Link key={link.to} to={link.to} aria-current={isHashActive(link.to) ? "location" : undefined}>
                {link.label}
              </Link>
            )
          )}
          <div className="nav-extra">
            <NavLink className="nav-extra-btn" to="/wishlist">
              <Icon name="heart" /> Wishlist{wishlistCount > 0 ? " (" + wishlistCount + ")" : ""}
            </NavLink>
            <button type="button" className="nav-extra-btn" onClick={toggleTheme}>
              <ThemeIcons />
              <span className="theme-label">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            ref={searchButtonRef}
            className={"icon-btn" + (searchOpen ? " is-active" : "")}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen((open) => !open);
            }}
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-controls="siteSearch"
          >
            <Icon name={searchOpen ? "close" : "search"} />
          </button>
          <button type="button" className="icon-btn hide-md" onClick={toggleTheme} aria-label={themeLabel}>
            <ThemeIcons />
          </button>
          <NavLink to="/wishlist" className="icon-btn" aria-label={"Wishlist, " + wishlistCount + (wishlistCount === 1 ? " item" : " items")}>
            <Icon name="heart" />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </NavLink>
          <button
            type="button"
            className={"bag-btn" + (bump ? " bump" : "")}
            onClick={() => openPanel("cart")}
            aria-label={"Open shopping bag, " + totals.itemCount + (totals.itemCount === 1 ? " item" : " items")}
            aria-expanded={panel === "cart"}
            aria-controls="cartDrawer"
            onAnimationEnd={() => setBump(false)}
          >
            <Icon name="bag" />
            <span className="bag-label">Bag</span>
            {totals.itemCount > 0 && (
              <span className="badge-count" data-testid="bag-count">
                {totals.itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            ref={menuToggleRef}
            className="icon-btn menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="navLinks"
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <div className="search-panel" id="siteSearch" hidden={!searchOpen}>
        <div className="container">{searchOpen && <SearchBar autoFocus onDone={() => setSearchOpen(false)} />}</div>
      </div>
    </header>
  );
}
