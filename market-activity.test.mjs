import assert from 'node:assert/strict';
import { marketStagnation } from './market-activity.mjs';

const hour = 3600, end = 100000;
const history = Array.from({ length: 9 }, (_, i) => ({ t: end - (8 - i) * hour, qty: 10 }));
assert.deepEqual(marketStagnation(history, end), { from: end - 8 * hour, to: end });
assert.ok(marketStagnation(history.map((r, i) => ({ ...r, qty: 10 + i })), end));
assert.equal(marketStagnation(history.slice(1), end), null); // Not yet a full eight hours.
assert.equal(marketStagnation(history.map((r, i) => ({ ...r, qty: i >= 6 ? 9 : 10 })), end), null);
assert.equal(marketStagnation(history.filter((r, i) => i < 3 || i > 5), end), null); // Long gap.
assert.equal(marketStagnation(history, end + 2 * hour + 1), null); // Stale, not unsold.
assert.equal(marketStagnation(history.map(r => ({ ...r, qty: 0 })), end), null);
assert.equal(marketStagnation(history.map((r, i) => i === 5 ? { t: r.t } : r), end), null);
assert.equal(marketStagnation([], end), null);
assert.equal(marketStagnation(history, NaN), null);
assert.ok(marketStagnation([...history, { t: end + hour, qty: 1 }], end)); // Future rows cannot affect the snapshot.
assert.equal(marketStagnation([...history, { t: end, qty: 10 }], end), null); // Conflicting observation time.
assert.deepEqual(marketStagnation([...history].reverse(), end), { from: end - 8 * hour, to: end });
// A decrease exactly at the start belongs to the preceding window.
assert.ok(marketStagnation([{ t: end - 9 * hour, qty: 20 }, ...history], end));
