import { useState, useCallback } from 'react';
import type { FavoriteItem } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addFavorite = useCallback((id: number, name: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === id)) return prev;
      return [...prev, { id, name, count: 1, tree: null, loading: true }];
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateTree = useCallback((id: number, tree: FavoriteItem['tree']) => {
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, tree, loading: false } : f))
    );
  }, []);

  const updateCount = useCallback((id: number, count: number) => {
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, count } : f))
    );
  }, []);

  const reorder = useCallback((from: number, to: number) => {
    setFavorites((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  return { favorites, addFavorite, removeFavorite, updateTree, updateCount, reorder, setFavorites };
}
