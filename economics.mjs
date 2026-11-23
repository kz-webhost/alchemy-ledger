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

// Latest snapshot of each item; a missing latest quote must not revive an old price.
export function evaluateLatest(item, byId) {
  const sale = item.history.at(-1)?.min ?? null;
  if (!item.recipe) return { sale, cost: null, profit: null, margin: null };
  let cost = 0;
  for (const part of item.recipe.parts) {
    const unit = byId.get(part.id)?.history.at(-1)?.min;
    if (unit == null) return { sale, cost: null, profit: null, margin: null };
    cost += unit * part.qty;
  }
  cost /= item.recipe.outQty;
  return { sale, cost, ...profitFor(sale, cost) };
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
