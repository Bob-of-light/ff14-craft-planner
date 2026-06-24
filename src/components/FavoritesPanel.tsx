import { useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import FavoriteItem from './FavoriteItem';
import type { FavoriteItem as FavoriteItemType, TreeNode } from '../types';

interface FavoritesPanelProps {
  favorites: FavoriteItemType[];
  onRemove: (id: number) => void;
  onReorder: (from: number, to: number) => void;
  onTreeChange: (id: number, tree: TreeNode) => void;
}

export default function FavoritesPanel({
  favorites,
  onRemove,
  onReorder,
  onTreeChange,
}: FavoritesPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = favorites.findIndex((f) => f.id === active.id);
    const newIdx = favorites.findIndex((f) => f.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(oldIdx, newIdx);
    }
  }, [favorites, onReorder]);

  const ids = useMemo(() => favorites.map((f) => f.id), [favorites]);

  return (
    <div>
      {favorites.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-8">
          使用上方搜尋列搜尋並收藏物品
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {favorites.map((item) => (
            <FavoriteItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onTreeChange={onTreeChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
