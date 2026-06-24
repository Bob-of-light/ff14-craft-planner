import { useEffect, useRef } from 'react';
import { getRecipeByResult } from '../api/recipes';
import { getItemName } from '../api/itemSearch';
import type { TreeNode, FavoriteItem } from '../types';
import type { RecipeIngredient } from '../types';

async function buildTree(
  itemId: number,
  amount: number,
  visited: Set<number>,
  depth: number
): Promise<TreeNode> {
  const name = await getItemName(itemId) || `Item#${itemId}`;

  if (depth > 10 || visited.has(itemId)) {
    return {
      itemId,
      name,
      amount,
      userInput: 0,
      children: [],
      isBaseMaterial: !visited.has(itemId),
      isCyclic: visited.has(itemId),
    };
  }

  const recipe = await getRecipeByResult(itemId);
  if (!recipe) {
    return {
      itemId,
      name,
      amount,
      userInput: 0,
      children: [],
      isBaseMaterial: true,
      isCyclic: false,
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(itemId);

  const children = await Promise.all(
    recipe.ingredients.map(async (ing: RecipeIngredient) => {
      return buildTree(ing.id, ing.amount * amount, nextVisited, depth + 1);
    })
  );

  return {
    itemId,
    name,
    amount,
    userInput: 0,
    children,
    isBaseMaterial: false,
    isCyclic: false,
  };
}

export function useCraftingTree(
  favorites: FavoriteItem[],
  updateTree: (id: number, tree: TreeNode | null) => void
) {
  const loadingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const fav of favorites) {
      if (fav.tree || fav.loading === false) continue;
      if (loadingRef.current.has(fav.id)) continue;

      loadingRef.current.add(fav.id);

      buildTree(fav.id, 1, new Set(), 0).then((tree) => {
        updateTree(fav.id, tree);
        loadingRef.current.delete(fav.id);
      }).catch(() => {
        updateTree(fav.id, null);
        loadingRef.current.delete(fav.id);
      });
    }
  }, [favorites, updateTree]);
}
