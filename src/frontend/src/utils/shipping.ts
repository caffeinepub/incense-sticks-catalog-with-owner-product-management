/**
 * Shipping fee calculation utility for location-based shipping costs.
 * Gurugram orders have free shipping; all other locations incur ₹80 shipping fee.
 */

/**
 * Calculates shipping fee in paise based on delivery city.
 * 
 * @param city - Delivery city name
 * @returns Shipping fee in paise (0 for Gurugram, 8000 for others)
 */
export function calculateShippingFee(city: string): bigint {
  const normalizedCity = city.trim().toLowerCase();
  
  // Check if city is Gurugram (including common variants)
  const gurugramVariants = [
    'gurugram',
    'gurgram',
    'gurgaon',
  ];
  
  const isGurugram = gurugramVariants.some(variant => 
    normalizedCity.includes(variant)
  );
  
  return isGurugram ? 0n : 8000n; // ₹80 = 8000 paise
}

/**
 * Checks if a city qualifies for free shipping (Gurugram).
 * 
 * @param city - Delivery city name
 * @returns true if city is Gurugram, false otherwise
 */
export function isFreeShipping(city: string): boolean {
  return calculateShippingFee(city) === 0n;
}
