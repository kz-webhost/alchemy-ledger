export const GAME_KNOWLEDGE_KEY = 'alchemy-ledger-game-knowledge-v1';

export function normalizeGameKnowledge(value) {
  if (!value || value.source !== 'game-cache' || !value.items || typeof value.items !== 'object' || Array.isArray(value.items)) return null;
  const items = {};
  for (const [id, learned] of Object.entries(value.items)) {
    if (/^[1-9]\d*$/.test(id) && typeof learned === 'boolean') items[id] = learned;
  }
  const timestamp = v => Number.isInteger(v) && v > 0 ? v : null;
  return { source: 'game-cache', savedAt: timestamp(value.savedAt), checkedAt: timestamp(value.checkedAt), items };
}

export async function loadGameKnowledge(fetcher, storage) {
  try {
    const response = await fetcher('knowledge.json?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw Error('knowledge');
    const snapshot = normalizeGameKnowledge(await response.json());
    if (!snapshot) throw Error('knowledge');
    try { storage.setItem(GAME_KNOWLEDGE_KEY, JSON.stringify(snapshot)); } catch {}
    return { snapshot, cached: false };
  } catch {
    let snapshot = null;
    try { snapshot = normalizeGameKnowledge(JSON.parse(storage.getItem(GAME_KNOWLEDGE_KEY))); } catch {}
    return { snapshot, cached: true };
  }
}
