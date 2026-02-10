/**
 * Normalizes a price value to ensure it's in paise (minor units).
 * Handles legacy data that may have been stored as rupees instead of paise.
 * 
 * Detection heuristic: If a price is less than 1000 (₹10.00), it's likely stored
 * as rupees and needs to be multiplied by 100 to convert to paise.
 * 
 * @param price - Price as bigint (may be in rupees or paise)
 * @returns Price in paise as bigint
 */
export function normalizePriceToPaise(price: bigint): bigint {
  // If price is less than 1000 (which would be ₹10.00 in paise),
  // assume it's stored as rupees and convert to paise
  if (price < 1000n) {
    return price * 100n;
  }
  return price;
}

/**
 * Formats a price stored as bigint (minor units/paise) to INR display string.
 * Automatically normalizes the price to handle legacy data.
 * 
 * @param price - Price in paise as bigint (will be normalized if needed)
 * @returns Formatted string like "₹299.00"
 */
export function formatINR(price: bigint): string {
  const normalizedPrice = normalizePriceToPaise(price);
  const rupees = Number(normalizedPrice) / 100;
  return `₹${rupees.toFixed(2)}`;
}

/**
 * Converts a rupee amount (as entered by users) to paise for backend storage.
 * 
 * @param rupees - Amount in rupees (e.g., 299.00)
 * @returns Amount in paise as bigint (e.g., 29900n)
 */
export function rupeesToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

/**
 * Converts paise to rupees for display in form inputs.
 * Automatically normalizes the price to handle legacy data.
 * 
 * @param paise - Amount in paise as bigint
 * @returns Amount in rupees as number (e.g., 299.00)
 */
export function paiseToRupees(paise: bigint): number {
  const normalizedPrice = normalizePriceToPaise(paise);
  return Number(normalizedPrice) / 100;
}
