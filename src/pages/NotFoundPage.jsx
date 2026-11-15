import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageMeta.js";

export default function NotFoundPage() {
  usePageTitle("Page not found");

  return (
    <section className="section page-section not-found" aria-labelledby="notFoundTitle">
      <div className="container">
        <p className="kicker">Error 404</p>
        <h1 className="section-title" id="notFoundTitle">
          This page does not exist.
        </h1>
        <p className="section-subtitle">The link may be old or mistyped. Try the shop or go back to the home page.</p>
        <div className="hero-buttons">
          <Link to="/shop" className="btn btn-primary btn-large">
            Shop all products
          </Link>
          <Link to="/" className="btn-link">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
