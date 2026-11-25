export function selectTrades(trades, item, includeReagents = true) {
  const ids = new Set([item.id]);
  if (includeReagents) for (const p of item.recipe?.parts || []) ids.add(p.id);
  return trades.filter(t => ids.has(t.id));
}

export function chartPeriod(item, trades, updated, hours) {
  const to = Math.max(updated, ...trades.map(t => t.t));
  const from = hours ? to - hours * 3600
    : Math.min(to, ...item.history.map(p => p.t), ...trades.map(t => t.t)) - 3600;
  return { from, to };
}

export function tradeLabel(trade) {
  if (trade.kind === 'buy') return '내 구매';
  return trade.status === 'estimated' ? '내 판매 (추정)' : '내 판매';
}

export function statusLabel(trade) {
  return { recorded: '구매 기록가', confirmed: '정산 확인', estimated: '등록가 추정', unknown: '가격 미기록' }[trade.status] || '가격 미기록';
}
