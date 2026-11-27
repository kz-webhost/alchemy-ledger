export const AH_CUT = 0.05;

export function money(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  const n = Math.round(Math.abs(value));
  const sign = value < 0 && n ? '−' : '';
  if (n >= 10000) return `${sign}${+(n / 10000).toFixed(2)}금`;
  if (n >= 100) return `${sign}${+(n / 100).toFixed(2)}은`;
  return `${sign}${n}동`;
}

export function signedMoney(value) {
  return value > 0 ? `+${money(value)}` : money(value);
}

export function percent(value) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

export function profitFor(sale, cost) {
  if (sale == null || cost == null) return { profit: null, margin: null };
  const profit = sale * (1 - AH_CUT) - cost;
  return { profit, margin: cost > 0 ? profit / cost : null };
}

// Vendor mode replaces only materials with a recorded, per-unit purchase price.
// It deliberately uses that price even if the auction house is cheaper.
export function recipeCosts(item, byId, quote) {
  if (!item.recipe) return { cost: null, vendorCost: null, hasVendor: false };
  let cost = 0, vendorCost = 0, hasVendor = false;
  for (const part of item.recipe.parts) {
    const material = byId.get(part.id), unit = quote(part.id);
    const vendor = Number.isFinite(material?.vendorPrice) && material.vendorPrice > 0 ? material.vendorPrice : null;
    hasVendor ||= vendor != null;
    if (unit == null) cost = null;
    else if (cost != null) cost += unit * part.qty;
    const alternative = vendor ?? unit;
    if (alternative == null) vendorCost = null;
    else if (vendorCost != null) vendorCost += alternative * part.qty;
  }
  return { cost: cost == null ? null : cost / item.recipe.outQty,
    vendorCost: hasVendor && vendorCost != null ? vendorCost / item.recipe.outQty : null, hasVendor };
}

// Latest snapshot of each item; a missing latest quote must not revive an old price.
export function evaluateLatest(item, byId) {
  const sale = item.history.at(-1)?.min ?? null;
  const costs = recipeCosts(item, byId, id => byId.get(id)?.history.at(-1)?.min ?? null);
  const vendor = profitFor(sale, costs.vendorCost);
  return { sale, ...costs, ...profitFor(sale, costs.cost), vendorProfit: vendor.profit, vendorMargin: vendor.margin };
}

export function compareItems(a, b, mode, evaluations) {
  const names = () => a.name.localeCompare(b.name, 'ko');
  if (mode === 'name') return names();
  const key = mode === 'price' ? 'sale' : mode === 'margin' ? 'margin' : 'profit';
  const av = evaluations.get(a.id)[key], bv = evaluations.get(b.id)[key];
  if (av == null) return bv == null ? names() : 1;
  if (bv == null) return -1;
  return bv - av || names();
}
