// Character floors follow profession rank caps; potion use levels are unrelated.
// https://www.wowhead.com/forever/guide/professions/overview
export function learningLimits(recipe) {
  const req = recipe?.requirements || {};
  const skill = Number.isInteger(req.skill) && req.skill > 0 ? req.skill : null;
  const rankLevel = skill == null ? null : skill > 225 ? 35 : skill > 150 ? 20 : skill > 75 ? 10 : 1;
  const directLevel = req.levelBasis !== 'profession-rank' ? req.characterLevel || 0 : 0;
  const level = rankLevel == null ? (Math.max(directLevel, req.recipeLevel || 0) || null)
    : Math.max(rankLevel, directLevel, req.recipeLevel || 0);
  return { skill, level };
}

export function recipeStatus(item, knowledge) {
  return knowledge[String(item.id)] === true ? 'learned'
    : knowledge[String(item.id)] === false ? 'unlearned' : 'unknown';
}

export function matchesRecipeFilters(item, filters, knowledge) {
  if (!item.recipe) return true;
  if (filters.status !== 'all' && recipeStatus(item, knowledge) !== filters.status) return false;
  const limits = learningLimits(item.recipe);
  for (const key of ['level', 'skill']) {
    if (filters[key] == null) continue;
    if (limits[key] == null) { if (!filters.includeUnknown) return false; }
    else if (limits[key] > filters[key]) return false;
  }
  return true;
}

export const STORAGE_KEY = 'alchemy-ledger-recipe-filters-v1';
export const defaultFilters = () => ({ status: 'all', level: null, skill: null, includeUnknown: true });

export function normalizePreferences(value) {
  const filters = defaultFilters();
  if (!value || typeof value !== 'object') return { filters };
  const saved = value.filters || {};
  if (['all', 'learned', 'unlearned', 'unknown'].includes(saved.status)) filters.status = saved.status;
  for (const [key, min, max] of [['level', 1, 60], ['skill', 0, 300]]) {
    if (Number.isInteger(saved[key]) && saved[key] >= min && saved[key] <= max) filters[key] = saved[key];
  }
  if (typeof saved.includeUnknown === 'boolean') filters.includeUnknown = saved.includeUnknown;
  // Older manually entered knowledge must never override the game's cache.
  return { filters };
}
