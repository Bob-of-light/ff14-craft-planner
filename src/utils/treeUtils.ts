import type { TreeNode, MaterialTotal } from '../types';

export function isCrystalItem(itemId: number, name: string): boolean {
  if (itemId >= 1 && itemId <= 18) return true;
  return /^(?:火|冰|風|雷|土|水)之(?:碎晶|水晶|晶簇)$/.test(name);
}

export function collectBaseMaterials(
  tree: TreeNode,
  multiplier: number
): { map: Map<number, number>; names: Map<number, string> } {
  const map = new Map<number, number>();
  const names = new Map<number, string>();

  function walk(node: TreeNode, mult: number) {
    if (node.isCyclic || isCrystalItem(node.itemId, node.name)) return;

    const total = node.amount * mult;
    const possessed = node.userInput || 0;
    const remaining = Math.max(0, total - possessed);

    if (node.isBaseMaterial || node.children.length === 0) {
      map.set(node.itemId, (map.get(node.itemId) || 0) + remaining);
      if (!names.has(node.itemId)) {
        names.set(node.itemId, node.name);
      }
    } else {
      const scale = total > 0 ? remaining / total : 0;
      for (const child of node.children) {
        if (!isCrystalItem(child.itemId, child.name)) {
          walk(child, mult * scale);
        }
      }
    }
  }

  walk(tree, multiplier);
  return { map, names };
}

export function mergeMaterialMaps(
  entries: { map: Map<number, number>; names: Map<number, string> }[]
): { map: Map<number, number>; names: Map<number, string> } {
  const resultMap = new Map<number, number>();
  const resultNames = new Map<number, string>();

  for (const { map, names } of entries) {
    for (const [id, qty] of map) {
      resultMap.set(id, (resultMap.get(id) || 0) + qty);
    }
    for (const [id, name] of names) {
      if (!resultNames.has(id)) {
        resultNames.set(id, name);
      }
    }
  }

  return { map: resultMap, names: resultNames };
}

export function collectAllBaseMaterials(
  inputs: { tree: TreeNode; count: number }[]
): MaterialTotal[] {
  const entries = inputs
    .filter((i): i is { tree: TreeNode; count: number } => !!i.tree)
    .map(({ tree, count }) => collectBaseMaterials(tree, count));
  const { map, names } = mergeMaterialMaps(entries);

  return Array.from(map.entries())
    .filter(([, totalRequired]) => totalRequired > 0)
    .map(([itemId, totalRequired]) => ({
      itemId,
      name: names.get(itemId) || `Item#${itemId}`,
      totalRequired,
    }))
    .sort((a, b) => b.totalRequired - a.totalRequired);
}
