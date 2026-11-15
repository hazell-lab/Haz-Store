// show a number as malaysian ringgit, e.g. RM1,299.00
export function formatPrice(amount) {
  return "RM" + amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// two digit number for editorial indexes (1 -> 01)
export function pad(number) {
  return String(number).padStart(2, "0");
}
