export function formatPrice(value: number) {
  if (value >= 100000) {
    const lakh = value / 100000;

    return Number.isInteger(lakh)
      ? `₹${lakh}L`
      : `₹${lakh.toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${Math.round(value / 1000)}K`;
  }

  return `₹${value}`;
}