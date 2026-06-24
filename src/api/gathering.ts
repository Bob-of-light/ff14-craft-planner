import { decode } from '@msgpack/msgpack';
import type { GatheringInfo } from '../types';

const BASE = 'https://beherw.github.io/FFXIV_Market/data';

const JOB_MAP: Record<number, { job: string; action: string }> = {
  0: { job: '採礦師', action: '採礦' },
  1: { job: '採礦師', action: '採石' },
  2: { job: '園藝師', action: '採伐' },
  3: { job: '園藝師', action: '割取' },
  4: { job: '漁師', action: '釣魚' },
  5: { job: '漁師', action: '刺魚' },
};

let methodsData: any = null;

async function loadMethods(): Promise<any> {
  if (methodsData) return methodsData;
  const res = await fetch(`${BASE}/obtainable-methods.msgpack`);
  const buf = await res.arrayBuffer();
  methodsData = decode(new Uint8Array(buf));
  return methodsData;
}

let preloadStarted = false;

function startPreload(): void {
  if (preloadStarted) return;
  preloadStarted = true;
  loadMethods().catch(() => {});
}

startPreload();

/**
 * Resolve the container that maps itemId → sources[].
 *
 * Optimized format (current): payload = { "123": [...], "456": [...] }
 * Legacy format:             payload = { v: 1, i: { "123": [...], ... } }
 */
function resolveContainer(payload: any): any {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.v === 1 && payload.i && typeof payload.i === 'object') {
    return payload.i;
  }
  return payload;
}

function val(map: any, key: number | string): any {
  if (!map) return undefined;
  if (map instanceof Map) return map.get(key) ?? map.get(String(key));
  return map[key] ?? map[String(key)];
}

export async function getGatheringInfo(itemId: number): Promise<GatheringInfo | null> {
  try {
    const payload = await loadMethods();
    const container = resolveContainer(payload);
    if (!container) return null;

    const sources = val(container, itemId);
    if (!sources) return null;

    const arr = Array.isArray(sources) ? sources : [sources];

    // Optimized format: s.type === 'gathering'; Legacy: s.t === 7
    const gather = arr.find((s: any) => s.type === 'gathering' || s.t === 7);
    if (!gather) return null;

    let gatheringType: number;
    let level: number;
    let nodes: any[];

    if (gather.type === 'gathering') {
      gatheringType = gather.gatheringType ?? 0;
      level = gather.level ?? 0;
      nodes = gather.nodes ?? [];
    } else if (gather.d) {
      const d = gather.d as any;
      gatheringType = d.type ?? 0;
      level = d.level ?? 0;
      nodes = d.nodes ?? [];
    } else {
      return null;
    }

    if (!Array.isArray(nodes) || nodes.length === 0) return null;

    const rawType = Math.abs(gatheringType);
    const jm = JOB_MAP[rawType] || { job: '採集', action: '採集' };
    const zoneName = nodes[0].zoneName || '';

    return {
      itemId,
      job: jm.job,
      action: jm.action,
      zone: zoneName,
      level,
    };
  } catch {
    return null;
  }
}

export async function checkGatheringCoverage(itemIds: number[]): Promise<{ found: number; total: number }> {
  if (itemIds.length === 0) return { found: 0, total: 0 };
  try {
    const payload = await loadMethods();
    const container = resolveContainer(payload);
    if (!container) return { found: 0, total: itemIds.length };

    let found = 0;
    for (const id of itemIds) {
      const sources = val(container, id);
      if (!sources) continue;
      const arr = Array.isArray(sources) ? sources : [sources];
      const hasGather = arr.some((s: any) => {
        if (s.type === 'gathering' && Array.isArray(s.nodes) && s.nodes.length > 0) return true;
        if (s.t === 7 && s.d && Array.isArray(s.d.nodes) && s.d.nodes.length > 0) return true;
        return false;
      });
      if (hasGather) found++;
    }
    return { found, total: itemIds.length };
  } catch {
    return { found: 0, total: itemIds.length };
  }
}
