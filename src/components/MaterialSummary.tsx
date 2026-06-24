import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { FavoriteItem, GatheringInfo } from '../types';
import { collectAllBaseMaterials } from '../utils/treeUtils';
import { getGatheringInfo } from '../api/gathering';
import PriceTooltip from './PriceTooltip';

interface MaterialSummaryProps {
  favorites: FavoriteItem[];
}

function exportToCsv(
  materials: { itemId: number; name: string; totalRequired: number }[],
  gatheringMap: Map<number, GatheringInfo>
) {
  const bom = '\uFEFF';
  const rows = [['素材名稱', '需求數量', '區域', '職業']];
  for (const m of materials) {
    const gi = gatheringMap.get(m.itemId);
    rows.push([m.name, String(m.totalRequired), gi?.zone || '', gi?.action || '']);
  }
  const csv = bom + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `素材統計_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MaterialSummary({ favorites }: MaterialSummaryProps) {
  const [sortByZone, setSortByZone] = useState(false);
  const [gatheringMap, setGatheringMap] = useState<Map<number, GatheringInfo>>(new Map());
  const fetchedRef = useRef<Set<number>>(new Set());

  const materials = useMemo(() => {
    const inputs = favorites
      .filter((f): f is FavoriteItem & { tree: NonNullable<FavoriteItem['tree']> } =>
        !f.loading && f.tree !== null
      )
      .map((f) => ({ tree: f.tree, count: f.count }));

    return collectAllBaseMaterials(inputs);
  }, [favorites]);

  useEffect(() => {
    const uncached = materials.filter((m) => !fetchedRef.current.has(m.itemId));
    if (uncached.length === 0) return;

    for (const m of uncached) fetchedRef.current.add(m.itemId);

    Promise.all(uncached.map((m) => getGatheringInfo(m.itemId))).then((results) => {
      const map = new Map<number, GatheringInfo>();
      for (const info of results) {
        if (info) map.set(info.itemId, info);
      }
      setGatheringMap((prev) => new Map([...prev, ...map]));
    });
  }, [materials]);

  const sorted = useMemo(() => {
    if (!sortByZone) return materials;
    return [...materials].sort((a, b) => {
      const ga = gatheringMap.get(a.itemId);
      const gb = gatheringMap.get(b.itemId);
      const za = ga?.zone || '';
      const zb = gb?.zone || '';
      const cz = za.localeCompare(zb);
      if (cz !== 0) return cz;
      return b.totalRequired - a.totalRequired;
    });
  }, [materials, sortByZone, gatheringMap]);

  const handleExport = useCallback(() => {
    exportToCsv(sorted, gatheringMap);
  }, [sorted, gatheringMap]);

  if (materials.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        尚未有素材統計
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b border-gray-600 pb-2">
        <h3 className="text-gray-300 text-sm font-bold">所需素材總量</h3>
        <button
          onClick={handleExport}
          className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
        >
          匯出 CSV
        </button>
      </div>

      <div className="text-xs text-gray-400 grid grid-cols-[2fr_auto_1.5fr_1fr] gap-2 px-2 py-1 border-b border-gray-700 mb-1">
        <span>素材名稱</span>
        <span className="text-right">數量</span>
        <button
          onClick={() => setSortByZone((v) => !v)}
          className="text-left hover:text-white transition-colors cursor-pointer"
        >
          區域{sortByZone ? ' ▲' : ''}
        </button>
        <span>職業</span>
      </div>

      <div className="space-y-0.5 max-h-[65vh] overflow-y-auto">
        {sorted.map((mat) => {
          const gi = gatheringMap.get(mat.itemId);
          return (
            <div
              key={mat.itemId}
              className="grid grid-cols-[2fr_auto_1.5fr_1fr] gap-2 px-2 py-1 rounded
                         bg-gray-800/50 hover:bg-gray-700/50 transition-colors items-center"
            >
              <span className="text-white text-xs truncate">
                <PriceTooltip itemId={mat.itemId} side="right">
                  <span className="cursor-help">{mat.name}</span>
                </PriceTooltip>
              </span>
              <span className="text-yellow-400 text-xs font-bold text-right">
                {mat.totalRequired}
              </span>
              <span className="text-gray-400 text-xs truncate">
                {gi ? gi.zone : '-'}
              </span>
              <span className="text-gray-400 text-xs truncate">
                {gi ? gi.action : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
