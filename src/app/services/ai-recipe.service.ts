import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeQuery, RecipeSuggestion } from '../models/recipes';

@Injectable({ providedIn: 'root' })
export class AiRecipeService {
  private lastResults = signal<RecipeSuggestion[] | null>(null);
  private loading = signal(false);
  private readonly baseUrl = 'http://localhost:4000/ai';

  constructor(private readonly http: HttpClient) {}

  generateRecipes(query: RecipeQuery): void {
    this.loading.set(true);
    this.http
      .post<{ recipes: RecipeSuggestion[] }>(`${this.baseUrl}/suggest-recipes`, query)
      .subscribe({
        next: (res) => {
          this.lastResults.set(res.recipes ?? []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch recipes from backend', err);
          this.lastResults.set([]);
          this.loading.set(false);
        },
      });
  }

  getLastResults(): RecipeSuggestion[] | null {
    return this.lastResults();
  }

  isLoading(): boolean {
    return this.loading();
  }

  getRecipeById(id: string): RecipeSuggestion | undefined {
    return this.lastResults()?.find((r) => r.id === id);
  }

  fetchRecipeDetails(id: string): void {
    const base = this.getRecipeById(id);
    if (!base) {
      return;
    }
    this.loading.set(true);
    this.http
      .post<RecipeSuggestion>(`${this.baseUrl}/recipe-details`, base)
      .subscribe({
        next: (detailed) => {
          const current = this.lastResults() ?? [];
          const updated = current.map((r) => (r.id === id ? detailed : r));
          this.lastResults.set(updated);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch recipe details', err);
          this.loading.set(false);
        },
      });
  }
}
