import { MAX_PRICE } from './pricing.js';

// Keep the stored catalog shape; only combine the owner's two inputs.
export function parsePriceEntry(value) {
  if (typeof value !== 'string') return null;
  const match = /^\s*([0-9]{1,8})(?:\s*[-–]\s*([0-9]{1,8}))?\s*$/.exec(value);
  if (!match) return null;
  const price = Number(match[1]), max = match[2] === undefined ? null : Number(match[2]);
  if (price > MAX_PRICE || (max !== null && (max > MAX_PRICE || max < price))) return null;
  return { price, max };
}

export function formatPriceEntry({ price, max }) {
  return max === null ? String(price) : `${price}–${max}`;
}
