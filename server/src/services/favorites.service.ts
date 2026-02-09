import { getDb } from './db';
import { RecipeSuggestion } from '../types/recipes';

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

/**
 * Retrieves all non-expired favorite recipes from the database.
 * Filters out entries older than 15 days.
 * @returns A promise that resolves to an array of favorite recipes.
 */
export async function getFavorites(): Promise<RecipeSuggestion[]> {
  const db = getDb();
  
  // Select all rows from the 'favorites' table with their creation timestamp
  const rows = await db.all('SELECT recipe, created_at FROM favorites');
  
  const now = Date.now();
  
  // Parse and filter recipes
  return rows
    .filter((row) => {
      const createdAt = row.created_at ? new Date(row.created_at).getTime() : 0;
      return createdAt && now - createdAt <= FIFTEEN_DAYS_MS;
    })
    .map((row) => JSON.parse(row.recipe) as RecipeSuggestion)
    .filter((recipe): recipe is RecipeSuggestion => 
      !!recipe && !!recipe.id && !!recipe.title
    );
}

/**
 * Adds a new favorite recipe to the database.
 * If the recipe already exists, it will not be added again.
 * @param recipe - The recipe to add to favorites.
 * @returns A promise that resolves to the added recipe.
 */
export async function addFavorite(recipe: RecipeSuggestion): Promise<RecipeSuggestion> {
  const db = getDb();
  const now = new Date().toISOString();
  
  // Use INSERT OR REPLACE to update timestamp if recipe exists
  await db.run(
    'INSERT OR REPLACE INTO favorites (id, recipe, created_at) VALUES (?, ?, ?)',
    recipe.id,
    JSON.stringify(recipe),
    now
  );
  
  return recipe;
}

/**
 * Removes a favorite recipe from the database by its ID.
 * @param id - The ID of the recipe to remove.
 * @returns A promise that resolves when the recipe has been removed.
 */
export async function removeFavorite(id: string): Promise<void> {
  const db = getDb();
  // Delete the recipe with the matching ID
  await db.run('DELETE FROM favorites WHERE id = ?', id);
}

/**
 * Removes all expired favorites (older than 15 days) from the database.
 * This should be called periodically to clean up old entries.
 * @returns A promise that resolves to the number of deleted entries.
 */
export async function cleanupExpiredFavorites(): Promise<number> {
  const db = getDb();
  const fifteenDaysAgo = new Date(Date.now() - FIFTEEN_DAYS_MS).toISOString();
  
  const result = await db.run(
    'DELETE FROM favorites WHERE created_at < ?',
    fifteenDaysAgo
  );
  
  return result.changes || 0;
}