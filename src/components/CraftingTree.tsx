import { useCallback } from 'react';
import TreeNode from './TreeNode';
import { isCrystalItem } from '../utils/treeUtils';
import type { TreeNode as TreeNodeType } from '../types';

interface CraftingTreeProps {
  tree: TreeNodeType;
  itemName: string;
  count: number;
  onTreeChange: (tree: TreeNodeType) => void;
}

function cloneAndUpdate(node: TreeNodeType, itemId: number, value: number): TreeNodeType {
  if (node.itemId === itemId) {
    return { ...node, userInput: value, children: node.children };
  }
  return {
    ...node,
    children: node.children.map((c) => cloneAndUpdate(c, itemId, value)),
  };
}

export default function CraftingTree({ tree, itemName, count, onTreeChange }: CraftingTreeProps) {
  const handleUserInput = useCallback((itemId: number, value: number) => {
    const next = cloneAndUpdate(tree, itemId, value);
    onTreeChange(next);
  }, [tree, onTreeChange]);

  const visibleChildren = tree.children.filter((c) => !isCrystalItem(c.itemId, c.name));

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-yellow-400 text-sm font-bold">{itemName}</span>
      </div>
      {visibleChildren.map((child, i) => (
        <TreeNode
          key={`${child.itemId}-${i}`}
          node={child}
          multiplier={count}
          onUserInput={handleUserInput}
          indent={1}
          isLast={i === visibleChildren.length - 1}
          parentPrefix=""
        />
      ))}
    </div>
  );
}
