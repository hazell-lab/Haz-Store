import { Link } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { Logo } from "./Header.jsx";

// links without a real page are shown as plain text, not dead links
const SOON = ["Contact", "Shipping", "Returns", "FAQ"];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <p className="footer-statement">Technology, edited.</p>
          <Link to="/shop" className="btn btn-invert">
            Shop the collection <Icon name="arrow" />
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Logo className="logo logo-footer" />
            <p>Modern electronics and accessories for work, gaming, and everyday life.</p>
          </div>

          <div className="footer-col">
            <h2>Shop</h2>
            <ul>
              <li><Link to="/shop">All products</Link></li>
              <li><Link to="/#featured">Featured</Link></li>
              <li><Link to="/#deals">Deals</Link></li>
              <li><Link to="/#categories">Categories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Your account</h2>
            <ul>
              <li><Link to="/cart">Bag</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Support</h2>
            <ul>
              {SOON.map((label) => (
                <li key={label}>
                  <span className="footer-soon">
                    {label} <span className="visually-hidden">(page not built yet)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h2>Company</h2>
            <ul>
              <li><Link to="/#about">About</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Haz Store. A fictional store built by Muhamad Hazim Aqil as a frontend portfolio project.</p>
          <p className="footer-meta">Prices in Malaysian ringgit (RM). Demo shop, no real orders or payments.</p>
        </div>
      </div>
    </footer>
  );
}
