import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CartTotals, ShipProgress } from "../components/CartSummary.jsx";
import { CatalogGate } from "../components/CatalogGate.jsx";
import { FormField } from "../components/FormField.jsx";
import { Icon } from "../components/Icon.jsx";
import { ProductImage } from "../components/ProductImage.jsx";
import { DEMO_ORDER_DELAY, MALAYSIAN_STATES, PAYMENT_METHODS } from "../config.js";
import { useToast } from "../context/ToastContext.jsx";
import { useCart } from "../hooks/useCart.js";
import { usePageTitle } from "../hooks/usePageMeta.js";
import { formatPrice } from "../utils/format.js";
import { CHECKOUT_FIELDS, createOrderNumber, validateCheckout, validateField } from "../utils/validation.js";

const EMPTY_FORM = { fullName: "", email: "", phone: "", address: "", city: "", postcode: "", state: "", payment: PAYMENT_METHODS[0].value };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function OrderSuccess({ order }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="order-success" tabIndex={-1} ref={ref} role="status">
      <span className="order-success-icon" aria-hidden="true">
        <Icon name="check" />
      </span>
      <p className="kicker">Demo order confirmed</p>
      <h2>Thank you, {order.name}.</h2>
      <p>
        Your demo order {order.number} ({formatPrice(order.total)}, {order.payment}) was recorded in this browser only. No payment was
        taken and nothing will be shipped. In a real store, a confirmation would be sent to {order.email}.
      </p>
      <dl className="order-meta">
        <div>
          <dt>Order</dt>
          <dd>{order.number}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>{order.payment}</dd>
        </div>
      </dl>
      <Link to="/shop" className="btn btn-primary">
        Continue shopping
      </Link>
    </div>
  );
}

function CheckoutContent() {
  const { lines, totals, clear } = useCart();
  const { showToast } = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const fieldRefs = useRef({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    // the error goes away while the user fixes the field
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  }

  function handleBlur(name) {
    setTouched((current) => ({ ...current, [name]: true }));
    // only check fields the user has typed in, so tabbing through does not shout errors
    if (values[name] !== "" || touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, values[name]) }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (lines.length === 0) {
      showToast("Your cart is empty");
      return;
    }
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    const firstError = CHECKOUT_FIELDS.find((name) => nextErrors[name]);
    if (firstError) {
      fieldRefs.current[firstError]?.focus();
      showToast("Please fix the errors in the form");
      return;
    }

    // demo only: wait a moment to show the loading state, nothing is sent anywhere
    setSubmitting(true);
    const summary = { total: totals.total, items: totals.itemCount };
    await wait(DEMO_ORDER_DELAY);
    if (!mounted.current) {
      return;
    }
    setOrder({
      number: createOrderNumber(),
      name: values.fullName.trim(),
      email: values.email.trim(),
      payment: values.payment,
      ...summary,
    });
    clear({ quiet: true });
    setValues(EMPTY_FORM);
    setTouched({});
    setSubmitting(false);
    showToast("Demo order placed");
  }

  if (order) {
    return <OrderSuccess order={order} />;
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-empty is-visible">
        <p>Your bag is empty. Add a product and your order summary will appear here.</p>
        <Link to="/shop" className="btn btn-outline">
          Browse the collection
        </Link>
      </div>
    );
  }

  const field = (name) => ({
    id: name,
    value: values[name],
    error: errors[name],
    inputRef: (node) => {
      fieldRefs.current[name] = node;
    },
    onChange: (event) => update(name, event.target.value),
    onBlur: () => handleBlur(name),
    disabled: submitting,
  });

  return (
    <div className="checkout-layout">
      <form className="checkout-form" noValidate onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset className="form-step">
          <legend className="form-title">
            <span className="step-num">1</span> Customer information
          </legend>
          <div className="form-grid">
            <FormField {...field("fullName")} label="Full name" autoComplete="name" full />
            <FormField {...field("email")} label="Email" type="email" autoComplete="email" />
            <FormField {...field("phone")} label="Phone number" type="tel" autoComplete="tel" placeholder="012-345 6789" />
          </div>
        </fieldset>

        <fieldset className="form-step">
          <legend className="form-title">
            <span className="step-num">2</span> Shipping address
          </legend>
          <div className="form-grid">
            <FormField {...field("address")} label="Address" autoComplete="street-address" full />
            <FormField {...field("city")} label="City" autoComplete="address-level2" />
            <FormField {...field("postcode")} label="Postcode" inputMode="numeric" autoComplete="postal-code" maxLength={5} />
            <FormField {...field("state")} label="State" as="select" autoComplete="address-level1" full>
              <option value="">Select state</option>
              {MALAYSIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </FormField>
          </div>
        </fieldset>

        <fieldset className="form-step payment-options" disabled={submitting}>
          <legend className="form-title">
            <span className="step-num">3</span> Payment method
          </legend>
          {PAYMENT_METHODS.map((method) => (
            <label className="payment-option" key={method.value}>
              <input
                type="radio"
                name="payment"
                value={method.value}
                checked={values.payment === method.value}
                onChange={() => update("payment", method.value)}
              />
              <span className="payment-tile">
                <Icon name={method.icon} /> {method.value}
              </span>
            </label>
          ))}
          <p className="form-note payment-note">
            Demo only: no card or bank details are asked for, and no payment is taken.
          </p>
        </fieldset>

        <button type="submit" className={"btn btn-primary btn-full btn-large place-order" + (submitting ? " is-loading" : "")} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" /> Placing demo order&hellip;
            </>
          ) : (
            <>
              Place demo order <span className="place-order-total">{formatPrice(totals.total)}</span>
            </>
          )}
        </button>
        <p className="form-note">By placing this demo order you agree that nothing will actually be charged or shipped.</p>
      </form>

      <aside className="order-summary" aria-labelledby="summaryTitle">
        <h2 className="form-title" id="summaryTitle">
          Order summary
        </h2>
        <ul className="summary-list">
          {lines.map((line) => (
            <li className="summary-item" key={line.id}>
              <div className="summary-thumb">
                <ProductImage src={line.product.image} alt="" />
                <span className="summary-qty" aria-hidden="true">
                  {line.quantity}
                </span>
              </div>
              <span className="summary-name">
                {line.product.name} × {line.quantity}
                <span className="summary-unit">{formatPrice(line.unitPrice)} each</span>
              </span>
              <span className="price">{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <ShipProgress totals={totals} />
        <CartTotals totals={totals} />
        <Link to="/cart" className="btn-link btn-link-muted summary-edit">
          Edit bag
        </Link>
        <ul className="summary-notes">
          <li>
            <Icon name="return" /> Returns within 14 days
          </li>
          <li>
            <Icon name="shield" /> 1-year warranty included
          </li>
        </ul>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  usePageTitle("Checkout");

  return (
    <section className="section section-alt checkout-section page-section" aria-labelledby="checkoutTitle">
      <div className="container">
        <header className="section-header section-header-split">
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="section-title" id="checkoutTitle">
              Almost yours.
            </h1>
          </div>
          <p className="section-subtitle">This is a demo checkout. No real payment is made.</p>
        </header>
        <p className="demo-banner" role="note">
          <strong>Demo checkout.</strong> Haz Store is a portfolio project: orders are not sent anywhere, no payment is taken and
          nothing is shipped.
        </p>
        <CatalogGate skeletons={2}>
          <CheckoutContent />
        </CatalogGate>
      </div>
    </section>
  );
}
