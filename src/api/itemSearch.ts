import { decode } from '@msgpack/msgpack';

const TW_ITEMS_URL = 'https://beherw.github.io/FFXIV_Market/data/tw-items.msgpack';
const ZH_ITEMS_URL = 'https://beherw.github.io/FFXIV_Market/data/zh-items.msgpack';

let twCache: Record<string, { tw: string }> | null = null;
let zhCache: Record<string, { zh: string }> | null = null;
let searchData: { id: number; name: string }[] | null = null;

async function loadTwItems(): Promise<Record<string, { tw: string }>> {
  if (twCache) return twCache;
  const res = await fetch(TW_ITEMS_URL);
  const buf = await res.arrayBuffer();
  twCache = decode(new Uint8Array(buf)) as Record<string, { tw: string }>;
  return twCache;
}

async function loadZhItems(): Promise<Record<string, { zh: string }>> {
  if (zhCache) return zhCache;
  const res = await fetch(ZH_ITEMS_URL);
  const buf = await res.arrayBuffer();
  zhCache = decode(new Uint8Array(buf)) as Record<string, { zh: string }>;
  return zhCache;
}

let preloadPromise: Promise<void> | null = null;

function startPreload(): void {
  if (!preloadPromise) {
    preloadPromise = new Promise((resolve) => {
      Promise.all([loadTwItems(), loadZhItems()]).then(() => resolve());
    });
  }
}

startPreload();

export async function loadSearchData(): Promise<{ id: number; name: string }[]> {
  if (searchData) return searchData;

  const [tw, zh] = await Promise.all([loadTwItems(), loadZhItems()]);
  const seen = new Set<number>();
  const items: { id: number; name: string }[] = [];

  for (const key of Object.keys(tw)) {
    const id = parseInt(key, 10);
    if (isNaN(id) || seen.has(id)) continue;
    const name = tw[key]?.tw;
    if (name && name.trim()) {
      seen.add(id);
      items.push({ id, name: name.trim() });
    }
  }

  for (const key of Object.keys(zh)) {
    const id = parseInt(key, 10);
    if (isNaN(id) || seen.has(id)) continue;
    const name = zh[key]?.zh;
    if (name && name.trim()) {
      seen.add(id);
      items.push({ id, name: name.trim() });
    }
  }

  searchData = items;
  return items;
}

export async function searchItems(query: string, maxResults = 30): Promise<{ id: number; name: string }[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const items = await loadSearchData();
  const lowerQuery = trimmed.toLowerCase();

  const exact: { id: number; name: string; score: number }[] = [];
  const partial: { id: number; name: string; score: number }[] = [];

  for (const item of items) {
    const lowerName = item.name.toLowerCase();
    if (lowerName === lowerQuery) {
      exact.push({ ...item, score: 3 });
    } else if (lowerName.startsWith(lowerQuery)) {
      partial.push({ ...item, score: 2 });
    } else if (lowerName.includes(lowerQuery)) {
      partial.push({ ...item, score: 1 });
    }
  }

  exact.sort((a, b) => a.id - b.id);
  partial.sort((a, b) => b.score - a.score || a.id - b.id);

  const all = [...exact, ...partial];
  return all.slice(0, maxResults).map(({ id, name }) => ({ id, name }));
}

export async function getItemName(itemId: number): Promise<string | null> {
  const tw = await loadTwItems();
  const entry = tw[itemId] || tw[String(itemId)];
  if (entry?.tw) return entry.tw;
  return null;
}

export async function getItemNamesBulk(itemIds: number[]): Promise<Map<number, string>> {
  const tw = await loadTwItems();
  const zh = await loadZhItems();
  const result = new Map<number, string>();

  for (const id of itemIds) {
    const e = tw[id] || tw[String(id)];
    if (e?.tw) { result.set(id, e.tw); continue; }
    const e2 = zh[id] || zh[String(id)];
    if (e2?.zh) result.set(id, e2.zh);
  }

  return result;
}
