const UNIVERSALIS_API = 'https://universalis.app/api/v2';
const TW_DC_NAME = '陸行鳥';

const WORLD_ID_TO_NAME: Record<number, string> = {
  4028: '伊弗利特', 4029: '迦樓羅', 4030: '利維坦',
  4031: '鳳凰', 4032: '奧汀', 4033: '巴哈姆特',
  4034: '拉姆', 4035: '泰坦',
};

export interface UniversalisPrice {
  itemId: number;
  price: number | null;
  worldName: string | null;
}

interface AggregatedEntry {
  minListing?: { dc?: { price?: number; worldId?: number }; region?: { price?: number; worldId?: number } };
  recentPurchase?: { dc?: { price?: number; worldId?: number }; region?: { price?: number; worldId?: number } };
  averageSalePrice?: { dc?: { price?: number } };
  dailySaleVelocity?: { dc?: { quantity?: number } };
}

interface AggregatedResult {
  itemId: number;
  nq?: AggregatedEntry;
  hq?: AggregatedEntry;
}

export async function fetchPrices(itemIds: number[]): Promise<Map<number, UniversalisPrice>> {
  if (itemIds.length === 0) return new Map();
  const result = new Map<number, UniversalisPrice>();
  const uniqueIds = [...new Set(itemIds)];

  for (let i = 0; i < uniqueIds.length; i += 100) {
    const batch = uniqueIds.slice(i, i + 100);
    const idsStr = batch.join(',');

    try {
      const url = `${UNIVERSALIS_API}/aggregated/${encodeURIComponent(TW_DC_NAME)}/${idsStr}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results) {
        for (const item of data.results as AggregatedResult[]) {
          result.set(item.itemId, extractBestPrice(item));
        }
      }
    } catch {
      continue;
    }
  }
  return result;
}

function extractBestPrice(item: AggregatedResult): UniversalisPrice {
  const candidates: { price: number; worldId?: number }[] = [];

  for (const entry of [item.nq, item.hq]) {
    if (entry?.minListing?.dc) {
      const p = entry.minListing.dc.price;
      const wid = entry.minListing.dc.worldId;
      if (p != null) candidates.push({ price: p, worldId: wid });
    }
    if (entry?.recentPurchase?.dc) {
      const p = entry.recentPurchase.dc.price;
      const wid = entry.recentPurchase.dc.worldId;
      if (p != null) candidates.push({ price: p, worldId: wid });
    }
  }

  if (candidates.length === 0) {
    return { itemId: item.itemId, price: null, worldName: null };
  }

  candidates.sort((a, b) => a.price - b.price);
  const best = candidates[0];

  return {
    itemId: item.itemId,
    price: best.price,
    worldName: best.worldId != null
      ? WORLD_ID_TO_NAME[best.worldId] ?? `World ${best.worldId}`
      : null,
  };
}

export async function fetchPriceSingle(itemId: number): Promise<UniversalisPrice> {
  const map = await fetchPrices([itemId]);
  return map.get(itemId) || { itemId, price: null, worldName: null };
}
