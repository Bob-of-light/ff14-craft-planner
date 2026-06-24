export interface WikiItem {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  id: number;
  amount: number;
}

export interface Recipe {
  itemId: number;
  resultId: number;
  amount: number;
  ingredients: RecipeIngredient[];
}

export interface TreeNode {
  itemId: number;
  name: string;
  amount: number;
  userInput: number;
  children: TreeNode[];
  isBaseMaterial: boolean;
  isCyclic: boolean;
}

export interface FavoriteItem {
  id: number;
  name: string;
  count: number;
  tree: TreeNode | null;
  loading: boolean;
}

export interface MaterialTotal {
  itemId: number;
  name: string;
  totalRequired: number;
}

export interface PriceInfo {
  itemId: number;
  price: number | null;
  worldName: string | null;
  loading: boolean;
}

export interface GatheringInfo {
  itemId: number;
  job: string;
  action: string;
  zone: string;
  level: number;
}
