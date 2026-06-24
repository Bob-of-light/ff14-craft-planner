import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CraftingTree from './CraftingTree';
import type { TreeNode, FavoriteItem as FavoriteItemType } from '../types';

interface FavoriteItemProps {
  item: FavoriteItemType;
  onRemove: (id: number) => void;
  onTreeChange: (id: number, tree: TreeNode) => void;
}

export default function FavoriteItem({ item, onRemove, onTreeChange }: FavoriteItemProps) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-2"
    >
      <div className="flex items-center justify-between mb-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 px-1"
          title="拖曳調整順序"
        >
          &#x2630;
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-500 hover:text-gray-300 mr-1 transition-colors"
          title={collapsed ? '展開' : '收合'}
        >
          {collapsed ? '\u25B6' : '\u25BC'}
        </button>
        <span className="text-white text-sm font-medium truncate flex-1 ml-1 mr-2">
          {item.name}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red-400 text-sm px-2 transition-colors"
          title="移除"
        >
          &times;
        </button>
      </div>

      {!collapsed && item.loading && (
        <div className="text-gray-400 text-xs px-6 py-2">
          載入生產樹...
        </div>
      )}

      {!collapsed && !item.loading && item.tree && (
        <CraftingTree
          tree={item.tree}
          itemName={item.name}
          onTreeChange={(tree) => onTreeChange(item.id, tree)}
        />
      )}

      {!collapsed && !item.loading && !item.tree && (
        <div className="text-gray-500 text-xs px-6 py-2">
          無生產配方
        </div>
      )}
    </div>
  );
}
