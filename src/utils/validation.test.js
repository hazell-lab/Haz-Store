import { describe, expect, it } from "vitest";
import { createOrderNumber, validateCheckout, validateField } from "./validation.js";

const valid = {
  fullName: "Test Buyer",
  email: "test@example.com",
  phone: "012-345 6789",
  address: "1 Jalan Test",
  city: "Shah Alam",
  postcode: "40000",
  state: "Selangor",
};

describe("checkout validation", () => {
  it("accepts a complete form", () => {
    expect(validateCheckout(valid)).toEqual({});
  });

  it("reports every empty field", () => {
    expect(Object.keys(validateCheckout({}))).toEqual(["fullName", "email", "phone", "address", "city", "postcode", "state"]);
  });

  it("checks email format", () => {
    expect(validateField("email", "nope")).toMatch(/valid email/);
    expect(validateField("email", "a@b.co")).toBe("");
  });

  it("accepts malaysian phone formats", () => {
    ["0123456789", "012-345 6789", "+60123456789", "03-1234 5678"].forEach((phone) => {
      expect(validateField("phone", phone)).toBe("");
    });
    ["12345", "0012345678", "+1 555 1234"].forEach((phone) => {
      expect(validateField("phone", phone)).not.toBe("");
    });
  });

  it("needs a five digit postcode and a two letter name", () => {
    expect(validateField("postcode", "4000")).toMatch(/5 digits/);
    expect(validateField("postcode", "40000")).toBe("");
    expect(validateField("fullName", " A ")).toMatch(/full name/);
  });

  it("makes demo order numbers from the time", () => {
    expect(createOrderNumber(1731744000123)).toBe("HAZ-000123");
  });
});
