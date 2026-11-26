// Direct uses of a crafted item, based on the saved recipe catalog.
export function buildProductUses(items) {
  const products = new Set(items.filter(item => item.recipe).map(item => item.id));
  const uses = new Map();
  for (const item of items) {
    const quantities = new Map();
    for (const part of item.recipe?.parts || []) {
      if (part.id === item.id || !products.has(part.id)) continue;
      quantities.set(part.id, (quantities.get(part.id) || 0) + part.qty);
    }
    for (const [id, qty] of quantities) {
      if (!uses.has(id)) uses.set(id, []);
      uses.get(id).push({ item, qty });
    }
  }
  for (const list of uses.values()) list.sort((a, b) => a.item.name.localeCompare(b.item.name, 'ko'));
  return uses;
}
