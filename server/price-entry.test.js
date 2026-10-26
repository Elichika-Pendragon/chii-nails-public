import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePriceEntry,formatPriceEntry} from '../src/price-entry.js';
import {defaultPrices,calculateServices} from '../src/pricing.js';

test('one price field round-trips the complete saved catalog without losing ranges',()=>{
  for(const item of Object.values(defaultPrices.items)) assert.deepEqual(parsePriceEntry(formatPriceEntry(item)),item);
  assert.deepEqual(parsePriceEntry('25000'),{price:25000,max:null});
  assert.deepEqual(parsePriceEntry(' 50000 - 55000 '),{price:50000,max:55000});
  assert.deepEqual(parsePriceEntry('1000–8000'),{price:1000,max:8000});
  assert.deepEqual(parsePriceEntry('0–10000000'),{price:0,max:10000000});
  assert.deepEqual(parsePriceEntry('25000–25000'),{price:25000,max:25000});
});
test('malformed, fractional, negative, inverted and excessive entries are rejected',()=>{
  for(const input of ['', ' ', '-100', '50000-', '50000--55000', '55000–50000', '1-2-3', '25000.5', '25.000', '25,000', '1e5', 'Infinity', 'NaN', '10000001', '0–10000001', '<script>', null, 25000]) assert.equal(parsePriceEntry(input),null,String(input));
});
test('switching a ranged accessory to fixed and back updates both calculator totals',()=>{
  const prices=structuredClone(defaultPrices), selection=[{id:'extras-4',quantity:2}];
  prices.items['extras-4']=parsePriceEntry('1000–8000');
  let total=calculateServices(prices,selection); assert.deepEqual([total.min,total.max],[2000,16000]);
  prices.items['extras-4']=parsePriceEntry('5000');
  total=calculateServices(prices,selection); assert.deepEqual([total.min,total.max],[10000,10000]);
});
