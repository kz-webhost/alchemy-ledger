export const STAGNATION_WINDOW = 8 * 3600;
export const MAX_OBSERVATION_GAP = 2 * 3600;
export const MARKET_WARNING_LABEL = '주의 · 8시간 매물 감소 없음';

// Listings are not completed sales. Require positive stock, a full eight-hour
// window, fresh observations, and no decreasing pair or long collection gap.
export function marketStagnation(history, asOf) {
  if (!Number.isFinite(asOf)) return null;
  const rows = history.filter(r => Number.isFinite(r.t) && r.t <= asOf).sort((a, b) => a.t - b.t);
  const last = rows.at(-1);
  if (!last || asOf - last.t > MAX_OBSERVATION_GAP) return null;
  const from = last.t - STAGNATION_WINDOW;
  let base = -1;
  for (let i = 0; i < rows.length && rows[i].t <= from; i++) base = i;
  if (base < 0 || from - rows[base].t > MAX_OBSERVATION_GAP) return null;
  for (let i = base; i < rows.length; i++) {
    const row = rows[i], previous = rows[i - 1];
    if (!Number.isFinite(row.qty) || row.qty <= 0) return null;
    if (i > base && (row.t <= previous.t || row.t - previous.t > MAX_OBSERVATION_GAP || row.qty < previous.qty)) return null;
  }
  return { from, to: last.t };
}
