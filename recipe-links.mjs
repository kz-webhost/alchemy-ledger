// Direct uses only; a recipe's ingredients are never mistaken for its consumers.
export function buildProductUses(items, catalog = {}) {
  const products = new Set(items.filter(item => item.recipe).map(item => item.id));
  const byId = new Map(items.map(item => [item.id, item]));
  const uses = new Map(), seen = new Map();
  const add = (id, use) => {
    if (!products.has(id)) return;
    const key = `${use.prof}:${use.out > 0 ? use.out : 'recipe:'+use.recipeID}:${use.qty}:${use.role}`;
    if (!uses.has(id)) { uses.set(id, []); seen.set(id, new Set()); }
    if (seen.get(id).has(key)) return;
    seen.get(id).add(key); uses.get(id).push(use);
  };
  for (const item of items) {
    const quantities = new Map();
    for (const part of item.recipe?.parts || []) {
      if (part.id === item.id || !products.has(part.id)) continue;
      quantities.set(part.id, (quantities.get(part.id) || 0) + part.qty);
    }
    for (const [id, qty] of quantities) {
      add(id, { item, out: item.id, name: item.name, prof: '연금술', qty, role: 'material' });
    }
  }
  for (const [key, entry] of Object.entries(catalog.items || {})) {
    const id = Number(key);
    for (const use of entry.crafts || []) {
      if (!Number.isInteger(use.recipeID) || !Number.isInteger(use.out) || !(use.qty > 0)
          || typeof use.name !== 'string' || typeof use.prof !== 'string'
          || !['material','tool'].includes(use.role)) continue;
      add(id, { ...use, item: byId.get(use.out) });
    }
  }
  for (const list of uses.values()) list.sort((a,b) => a.prof.localeCompare(b.prof,'ko') || a.name.localeCompare(b.name,'ko') || a.qty-b.qty);
  return uses;
}

export function questUsesFor(id, catalog = {}) {
  return (catalog.items?.[String(id)]?.quests || []).filter(q =>
    Number.isInteger(q.id) && q.id > 0 && typeof q.name === 'string' && q.qty > 0);
}

export function usageQuantity(use) {
  return use.role === 'tool' ? '필요 도구 · 소모 안 됨' : `1회 제작에 ${use.qty}개 필요`;
}
