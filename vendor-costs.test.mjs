import assert from 'node:assert/strict';
import { evaluateLatest, recipeCosts, compareItems } from './economics.mjs';

const product = { id: 20, name: '제작품', history: [{ min: 1000 }],
  recipe: { outQty: 2, parts: [{ id: 10, qty: 2 }, { id: 12, qty: 3 }] } };
const herb = { id: 10, history: [{ min: 100 }] };
const vial = { id: 12, vendorPrice: 3.6, history: [{ min: 5 }] };
function evaluate(v = vial, h = herb, p = product) {
  return evaluateLatest(p, new Map([[20, p], [10, h], [12, v]]));
}
const value = evaluate();
assert.equal(value.cost, 107.5);
assert.ok(Math.abs(value.vendorCost - 105.4) < 1e-9);
assert.equal(value.profit, 842.5);
assert.ok(Math.abs(value.vendorMargin - (950 - 105.4) / 105.4) < 1e-9);
assert.equal(evaluate({ ...vial, vendorPrice: 50 }).vendorCost, 175);
const missing = evaluate({ ...vial, history: [{ min: 5 }, { min: null }] });
assert.equal(missing.profit, null); // Do not revive the previous auction quote.
assert.ok(missing.vendorProfit > 0);
assert.equal(evaluate({ ...vial, history: [] }, { ...herb, history: [] }).vendorProfit, null);
assert.equal(evaluate(vial, herb, { ...product, history: [] }).vendorProfit, null);
assert.equal(evaluate({ ...vial, vendorPrice: undefined }).hasVendor, false);
assert.equal(evaluate({ ...vial, vendorPrice: undefined }).vendorCost, null);
assert.equal(evaluate({ ...vial, vendorPrice: 0 }).hasVendor, false);
const historical = recipeCosts(product, new Map([[10, herb], [12, vial]]), id => id === 10 ? 40 : null);
assert.equal(historical.cost, null);
assert.ok(Math.abs(historical.vendorCost - 45.4) < 1e-9);
const other = { id: 30, name: '다른 제작품' };
assert.ok(compareItems(product, other, 'profit', new Map([[20, value], [30, { profit: value.profit - 1, vendorProfit: value.vendorProfit + 100 }]])) < 0);
