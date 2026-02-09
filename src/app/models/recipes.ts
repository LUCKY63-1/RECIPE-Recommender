export interface RecipeQuery {
  ingredients: string[];
  diet?: 'veg' | 'non-veg' | 'vegan' | 'jain' | 'keto' | 'custom';
  timeLimitMinutes?: number;
  cuisineFocus?: string;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  servings?: number;
  avoidIngredients?: string[];
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  isFromUserKitchen: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  shortDescription: string;
  cuisineRegion: string;
  isVegetarian: boolean;
  tags: string[];
  estimatedTimeMinutes: number;
  difficulty: Difficulty;
  ingredients: RecipeIngredient[];
  steps: string[];
  tips: string[];
  servingSize?: number;
  nutrition?: NutritionalInfo;
}
