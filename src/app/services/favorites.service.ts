import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../environments/supabase.config';
import { RecipeSuggestion } from '../models/recipes';

interface FavoriteRow {
  id: string;
  recipe_id: string;
  recipe: any;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private supabase: SupabaseClient;
  private readonly table = 'favorites';
  private readonly localStorageKey = 'recipe_favorites';

  private readonly favoritesSignal = signal<RecipeSuggestion[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  readonly favorites = computed(() => this.favoritesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized:', SUPABASE_URL);
    this.loadFavorites();
  }

  private async loadFromLocalStorage(): Promise<RecipeSuggestion[]> {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      const favorites = stored ? JSON.parse(stored) : [];
      console.log('Loaded favorites from localStorage:', favorites);
      return Array.isArray(favorites) ? favorites.filter((r): r is RecipeSuggestion => !!r && !!r.id && !!r.title) : [];
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }

  private saveToLocalStorage(favorites: RecipeSuggestion[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(favorites));
      console.log('Saved favorites to localStorage:', favorites);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  async loadFavorites(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      console.log('Loading favorites from Supabase...');
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load favorites from Supabase:', error.message);
        // Fallback to localStorage
        const localFavorites = await this.loadFromLocalStorage();
        this.favoritesSignal.set(localFavorites);
        this.errorSignal.set(`Failed to sync with cloud storage. Showing local favorites: ${error.message}`);
        return;
      }

      console.log('Loaded favorites data:', data);
      const mapped = (data || [])
        .map((row: FavoriteRow) => row.recipe as RecipeSuggestion)
        .filter((r): r is RecipeSuggestion => !!r && !!r.id && !!r.title);
      console.log('Mapped favorites:', mapped);
      this.favoritesSignal.set(mapped);
      this.saveToLocalStorage(mapped); // Sync to localStorage
    } catch (networkError) {
      console.error('Network error loading favorites:', networkError);
      // Fallback to localStorage
      const localFavorites = await this.loadFromLocalStorage();
      this.favoritesSignal.set(localFavorites);
      this.errorSignal.set('Unable to connect to cloud storage. Showing local favorites.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  isFavorite(id: string | undefined | null): boolean {
    if (!id) return false;
    return this.favoritesSignal().some((r) => r.id === id);
  }

  async toggleFavorite(recipe: RecipeSuggestion): Promise<void> {
    if (!recipe || !recipe.id) {
      console.error('Invalid recipe for toggleFavorite:', recipe);
      return;
    }

    console.log('Toggling favorite for recipe:', recipe.id);

    const isCurrentlyFavorite = this.isFavorite(recipe.id);
    let success = false;

    if (isCurrentlyFavorite) {
      console.log('Removing favorite:', recipe.id);
      try {
        const { error } = await this.supabase
          .from(this.table)
          .delete()
          .eq('recipe_id', recipe.id);
        if (error) {
          console.error('Failed to remove favorite from Supabase:', error.message);
          // Still remove from local state for better UX
          this.favoritesSignal.set(this.favoritesSignal().filter((r) => r.id !== recipe.id));
          this.saveToLocalStorage(this.favoritesSignal());
          this.errorSignal.set(`Failed to sync removal with cloud: ${error.message}`);
          return;
        }
        this.favoritesSignal.set(this.favoritesSignal().filter((r) => r.id !== recipe.id));
        this.saveToLocalStorage(this.favoritesSignal());
        console.log('Favorite removed successfully');
        success = true;
      } catch (networkError) {
        console.error('Network error removing favorite:', networkError);
        // Still remove from local state
        this.favoritesSignal.set(this.favoritesSignal().filter((r) => r.id !== recipe.id));
        this.saveToLocalStorage(this.favoritesSignal());
        this.errorSignal.set('Unable to connect to cloud storage. Changes saved locally.');
      }
    } else {
      console.log('Adding favorite:', recipe.id);
      try {
        const payload = {
          recipe_id: recipe.id,
          recipe,
        };
        const { data, error } = await this.supabase
          .from(this.table)
          .insert(payload)
          .select('*')
          .single();
        if (error) {
          console.error('Failed to add favorite to Supabase:', error.message);
          // Still add to local state for better UX
          this.favoritesSignal.set([recipe, ...this.favoritesSignal()]);
          this.saveToLocalStorage(this.favoritesSignal());
          this.errorSignal.set(`Failed to sync addition with cloud: ${error.message}`);
          return;
        }
        const saved = (data?.recipe || recipe) as RecipeSuggestion;
        this.favoritesSignal.set([saved, ...this.favoritesSignal()]);
        this.saveToLocalStorage(this.favoritesSignal());
        console.log('Favorite added successfully');
        success = true;
      } catch (networkError) {
        console.error('Network error adding favorite:', networkError);
        // Still add to local state
        this.favoritesSignal.set([recipe, ...this.favoritesSignal()]);
        this.saveToLocalStorage(this.favoritesSignal());
        this.errorSignal.set('Unable to connect to cloud storage. Changes saved locally.');
      }
    }

    // Clear error after successful operation
    if (success) {
      this.errorSignal.set(null);
    }
  }
}

