import type { WikiItem } from '../types';

interface SearchResultsProps {
  results: WikiItem[];
  loading: boolean;
  onAdd: (item: WikiItem) => void;
  favorites: Set<number>;
}

export default function SearchResults({ results, loading, onAdd, favorites }: SearchResultsProps) {
  if (results.length === 0 && !loading) return null;

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-1 z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
        {loading && (
          <div className="px-4 py-3 text-gray-400 text-sm">
            搜尋中...
          </div>
        )}
        {!loading && results.length === 0 && (
          <div className="px-4 py-3 text-gray-400 text-sm">
            查無結果
          </div>
        )}
        {!loading && results.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-700
                       transition-colors border-b border-gray-700 last:border-b-0"
          >
            <span className="text-white text-sm truncate flex-1">
              {item.name}
            </span>
            <button
              onClick={() => onAdd(item)}
              disabled={favorites.has(item.id)}
              className={`ml-3 px-3 py-1 rounded text-sm font-medium transition-colors shrink-0
                ${favorites.has(item.id)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
              {favorites.has(item.id) ? '已收藏' : '✦ 收藏'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
