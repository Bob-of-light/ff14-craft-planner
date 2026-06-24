import { decode } from '@msgpack/msgpack';
import type { Recipe, RecipeIngredient } from '../types';

const RECIPES_URL = 'https://beherw.github.io/FFXIV_Market/data/recipes.msgpack';

interface RawRecipe {
  id: string | number;
  result: number;
  ingredients: RawIngredient[];
  companyCraft?: boolean;
}

interface RawIngredient {
  id: number;
  amount: number;
}

let recipesCache: Recipe[] | null = null;
let byResultCache: Map<number, Recipe[]> | null = null;

async function loadRecipes(): Promise<{ recipes: Recipe[]; byResult: Map<number, Recipe[]> }> {
  if (recipesCache && byResultCache) {
    return { recipes: recipesCache, byResult: byResultCache };
  }

  const res = await fetch(RECIPES_URL);
  const buf = await res.arrayBuffer();
  const raw = decode(new Uint8Array(buf)) as RawRecipe[];

  const byResult = new Map<number, Recipe[]>();

  const recipes: Recipe[] = raw
    .filter((r) => !r.companyCraft && typeof r.id !== 'string')
    .map((r) => ({
      itemId: r.result,
      resultId: r.result,
      amount: 1,
      ingredients: r.ingredients.map((i: RawIngredient) => ({
        id: i.id,
        amount: i.amount,
      })),
    }));

  for (const recipe of recipes) {
    const list = byResult.get(recipe.resultId) || [];
    list.push(recipe);
    byResult.set(recipe.resultId, list);
  }

  recipesCache = recipes;
  byResultCache = byResult;
  return { recipes, byResult };
}

export async function getRecipeByResult(itemId: number): Promise<Recipe | null> {
  const { byResult } = await loadRecipes();
  const list = byResult.get(itemId);
  if (!list || list.length === 0) return null;
  return list[0];
}

export async function hasRecipe(itemId: number): Promise<boolean> {
  const { byResult } = await loadRecipes();
  return byResult.has(itemId);
}
