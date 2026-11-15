// checkout form rules
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// malaysian numbers: 0123456789, 012-345 6789, +60123456789, 03-1234 5678
const PHONE_PATTERN = /^(\+?60|0)[1-9][0-9]{7,9}$/;
const POSTCODE_PATTERN = /^[0-9]{5}$/;

// in the order they appear in the form (the first error gets focus)
export const CHECKOUT_FIELDS = ["fullName", "email", "phone", "address", "city", "postcode", "state"];

const rules = {
  fullName: (value) => (value.trim().length >= 2 ? "" : "Please enter your full name"),
  email: (value) => (EMAIL_PATTERN.test(value.trim()) ? "" : "Please enter a valid email address"),
  phone: (value) =>
    PHONE_PATTERN.test(value.trim().replace(/[\s-]/g, ""))
      ? ""
      : "Please enter a valid Malaysian phone number, e.g. 012-345 6789",
  address: (value) => (value.trim() !== "" ? "" : "Please enter your address"),
  city: (value) => (value.trim() !== "" ? "" : "Please enter your city"),
  postcode: (value) => (POSTCODE_PATTERN.test(value.trim()) ? "" : "Postcode must be 5 digits"),
  state: (value) => (value.trim() !== "" ? "" : "Please select your state"),
};

// error message for one field ("" when it is valid)
export function validateField(name, value) {
  const rule = rules[name];
  return rule ? rule(value || "") : "";
}

// errors for the whole form, only fields with an error are included
export function validateCheckout(values) {
  const errors = {};
  CHECKOUT_FIELDS.forEach((name) => {
    const message = validateField(name, values[name]);
    if (message) {
      errors[name] = message;
    }
  });
  return errors;
}

// demo order number, e.g. HAZ-482913
export function createOrderNumber(now = Date.now()) {
  return "HAZ-" + String(now).slice(-6);
}
