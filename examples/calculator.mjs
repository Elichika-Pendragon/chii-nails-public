import assert from 'node:assert/strict';
import { calculateServices, defaultPrices, priceRange } from '../src/pricing.js';
const choices = ['nail-art-0','cat-eye-0','extras-1','extras-2','removal-3'].map(id=>({id,quantity:1}));
const estimate = calculateServices(defaultPrices,choices,{kit:false,glue:false});
assert.equal(estimate.min,123000);
assert.equal(estimate.max,123000);
console.log('Synthetic example: plain nails + cat eye + 10 extensions + glitter + 10 gel removals');
console.log('Estimate:',priceRange(estimate.min,estimate.max));
console.log('No booking created, no bank transfer verified, no network request sent.');
