import { Component, computed } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../services/favorites.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslatePipe],
  template: `
    <div class="container mt-5">
      <h2 class="mb-4">{{ 'favorites.title' | translate }}</h2>
      <a routerLink="/" class="btn btn-outline-secondary mb-3">{{ 'favorites.backToHome' | translate }}</a>

      <!-- No favorites -->
      <div *ngIf="favorites().length === 0" class="text-center text-muted">
        <i class="bi bi-heart display-4 text-muted mb-3"></i>
        <p>{{ 'favorites.noFavorites' | translate }}</p>
        <p class="text-sm">{{ 'favorites.exploreMessage' | translate }}</p>
      </div>

      <!-- Favorites list -->
      <div class="row g-4" *ngIf="favorites().length > 0">
        <div class="col-md-6" *ngFor="let r of favorites()">
          <div class="favorite-card h-100 recipe-card-hover card">
            <div class="card-body">
              <h5 class="card-title">{{ r.title }}</h5>
              <p class="card-text text-muted">
                {{ r.shortDescription || 'Saved AI recipe.' }}
              </p>
              <a [routerLink]="['/recipe', r.id]" class="btn btn-sm btn-outline-primary">
                {{ 'favorites.viewRecipe' | translate }}
              </a>
              <button
                class="btn btn-sm btn-outline-danger ms-2"
                (click)="toggleFavorite(r)"
              >
                <i class="bi bi-heart-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FavoritesPageComponent {
  favorites = computed(() => this.favoritesService.favorites());

  constructor(public readonly favoritesService: FavoritesService) {}

  async toggleFavorite(recipe: any) {
    await this.favoritesService.toggleFavorite(recipe);
  }
}