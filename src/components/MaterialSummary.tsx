import { useMemo, useCallback } from 'react';
import type { FavoriteItem } from '../types';
import { collectAllBaseMaterials } from '../utils/treeUtils';

interface MaterialSummaryProps {
  favorites: FavoriteItem[];
}

function exportToCsv(materials: { name: string; totalRequired: number }[]) {
  const bom = '\uFEFF';
  const rows = [['素材名稱', '需求數量']];
  for (const m of materials) {
    rows.push([m.name, String(m.totalRequired)]);
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
  const materials = useMemo(() => {
    const trees = favorites
      .filter((f): f is FavoriteItem & { tree: NonNullable<FavoriteItem['tree']> } =>
        !f.loading && f.tree !== null
      )
      .map((f) => f.tree);

    return collectAllBaseMaterials(trees);
  }, [favorites]);

  const handleExport = useCallback(() => {
    exportToCsv(materials);
  }, [materials]);

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
      <div className="space-y-1 max-h-[70vh] overflow-y-auto">
        {materials.map((mat) => (
          <div
            key={mat.itemId}
            className="flex items-center justify-between px-2 py-1.5 rounded
                       bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-white text-xs truncate flex-1 mr-2">
              {mat.name}
            </span>
            <span className="text-yellow-400 text-xs font-bold shrink-0">
              x{mat.totalRequired}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
