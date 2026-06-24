import { useCallback } from 'react';
import PriceTooltip from './PriceTooltip';
import { isCrystalItem } from '../utils/treeUtils';
import type { TreeNode as TreeNodeType } from '../types';

interface TreeNodeProps {
  node: TreeNodeType;
  multiplier: number;
  onUserInput: (itemId: number, value: number) => void;
  indent: number;
  isLast?: boolean;
  parentPrefix?: string;
}

export default function TreeNode({ node, multiplier, onUserInput, indent, isLast = false, parentPrefix = '' }: TreeNodeProps) {
  if (isCrystalItem(node.itemId, node.name)) return null;

  const totalAmount = node.amount * multiplier;
  const possessed = node.userInput || 0;
  const remaining = Math.max(0, totalAmount - possessed);
  const scale = totalAmount > 0 ? remaining / totalAmount : 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      onUserInput(node.itemId, val);
    } else if (e.target.value === '') {
      onUserInput(node.itemId, 0);
    }
  }, [node.itemId, onUserInput]);

  const visibleChildren = node.children.filter((c) => !isCrystalItem(c.itemId, c.name));

  const branch = isLast ? '└── ' : '├── ';
  const line = isLast ? '    ' : '│   ';

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-700/50 transition-colors font-mono"
        style={{ paddingLeft: `${indent > 0 ? 0 : 0}px` }}
      >
        {indent > 0 && (
          <span className="text-gray-500 text-xs shrink-0 whitespace-pre select-none">{parentPrefix}{branch}</span>
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          {indent > 0 && (
            <span className="text-gray-400 text-xs shrink-0">
              {totalAmount > 0 && (
                <>
                  <input
                    type="number"
                    min="0"
                    value={node.userInput || ''}
                    onChange={handleChange}
                    className="w-14 px-1.5 py-0.5 bg-gray-700 border border-gray-500 rounded
                               text-white text-xs text-center
                               focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                  <span className="text-gray-500 ml-1">/ {totalAmount}</span>
                </>
              )}
            </span>
          )}
          <PriceTooltip itemId={node.itemId}>
            <span className={`text-sm truncate cursor-help ml-1
              ${node.isBaseMaterial && node.children.length === 0 ? 'text-yellow-300' : 'text-blue-300'}
              ${node.isCyclic ? 'text-red-400 line-through' : ''}`}
            >
              {node.name}
            </span>
          </PriceTooltip>
        </div>
      </div>

      {visibleChildren.map((child, i) => (
        <TreeNode
          key={`${child.itemId}-${i}`}
          node={child}
          multiplier={multiplier * scale}
          onUserInput={onUserInput}
          indent={indent + 1}
          isLast={i === visibleChildren.length - 1}
          parentPrefix={indent > 0 ? parentPrefix + line : ''}
        />
      ))}
    </div>
  );
}
