import { useState, useCallback, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import FavoritesPanel from './components/FavoritesPanel';
import MaterialSummary from './components/MaterialSummary';
import { useSearch } from './hooks/useSearch';
import { useFavorites } from './hooks/useFavorites';
import { useCraftingTree } from './hooks/useCraftingTree';
import type { TreeNode, WikiItem } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading } = useSearch(searchQuery);
  const { favorites, addFavorite, removeFavorite, updateTree, updateCount, reorder } = useFavorites();

  useCraftingTree(favorites, updateTree);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAdd = useCallback((item: WikiItem) => {
    addFavorite(item.id, item.name);
  }, [addFavorite]);

  const handleTreeChange = useCallback((id: number, tree: TreeNode) => {
    updateTree(id, tree);
  }, [updateTree]);

  const favoriteSet = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 py-3">
        <div className="relative max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
          <SearchResults
            results={results}
            loading={loading}
            onAdd={handleAdd}
            favorites={favoriteSet}
          />
        </div>
      </header>

      <main className="flex-1 flex gap-4 px-4 py-4 overflow-hidden">
        <section className="flex-1 min-w-0 overflow-y-auto">
          <FavoritesPanel
            favorites={favorites}
            onRemove={removeFavorite}
            onReorder={reorder}
            onTreeChange={handleTreeChange}
            onCountChange={updateCount}
          />
        </section>

        <aside className="flex-1 min-w-0 overflow-y-auto border-l border-gray-700 pl-4">
          <MaterialSummary favorites={favorites} />
        </aside>
      </main>
    </div>
  );
}
