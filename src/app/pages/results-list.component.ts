import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AiRecipeService } from '../services/ai-recipe.service';
import { FavoritesService } from '../services/favorites.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { BreadcrumbComponent } from '../components/breadcrumb.component';


@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TranslatePipe, BreadcrumbComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container mt-5">
      <app-breadcrumb></app-breadcrumb>
      <div class="card neumorphic-card">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <div class="flex-grow-1">
              <h2 class="card-title fw-semibold mb-1">
                <i class="bi bi-egg-fried me-2"></i>
                {{ 'results.title' | translate }}
              </h2>
              <p class="text-muted small mb-0">{{ 'results.subtitle' | translate }}</p>
            </div>
          </div>

          <div *ngIf="aiService.isLoading()" class="d-flex justify-content-center align-items-center mb-4">
            <div class="text-center">
              <dotlottie-wc src="https://lottie.host/b8d6b5bb-7da7-4d8d-99e4-1ffc5a0da9b0/LN3A7SerUe.lottie" style="width: 300px;height: 300px" autoplay loop></dotlottie-wc>
              <p class="mt-2 text-muted">{{ 'results.loading' | translate }}</p>
            </div>
          </div>


          <div class="row g-4" *ngIf="!aiService.isLoading() && recipes().length > 0">
            <div *ngFor="let r of recipes(); let i = index" class="col-lg-6 animate-slide-up" [style.animationDelay]="(i * 80) + 'ms'">
              <div class="card h-100 recipe-card-hover cursor-pointer" (click)="onRecipeClick(r.id)">
                <div class="card-body d-flex flex-column">
                  <h3 class="h5 card-title mb-2">{{ r.title }}</h3>
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                      <i class="bi bi-clock me-1"></i>{{ r.estimatedTimeMinutes }} {{ 'results.minutes' | translate }}
                    </span>
                    <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                      <i class="bi bi-globe me-1"></i>{{ r.cuisineRegion }}
                    </span>
                    <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                      <i class="bi bi-signal me-1"></i>{{ r.difficulty }}
                    </span>
                    <span *ngIf="r.isVegetarian" class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                      <i class="bi bi-flower1 me-1"></i>{{ 'results.vegetarian' | translate }}
                    </span>
                    <span *ngIf="!r.isVegetarian" class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                      <i class="bi bi-droplet-half me-1"></i>{{ 'results.nonVeg' | translate }}
                    </span>
                  </div>
                  <p class="card-text text-muted small flex-grow-1">
                    {{ r.shortDescription || ('results.defaultDescription' | translate) }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="text-muted small">
                      <i class="bi bi-person me-1"></i>{{ r.servingSize || 4 }} {{ 'results.servings' | translate }}
                    </span>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-secondary neumorphic-btn" (click)="toggleFavorite(r); $event.stopPropagation()">
                        <i class="bi" [ngClass]="favorites.isFavorite(r.id) ? 'bi-heart-fill text-danger' : 'bi-heart'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary neumorphic-btn" (click)="onRecipeClick(r.id); $event.stopPropagation()">
                        <i class="bi bi-eye me-1"></i>{{ 'results.viewRecipe' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./results-list.component.css'],
})
export class ResultsListComponent {
  router = inject(Router);
  aiService = inject(AiRecipeService);
  favorites = inject(FavoritesService);

  recipes = computed(() => this.aiService.getLastResults() ?? []);

  async toggleFavorite(recipe: any) {
    await this.favorites.toggleFavorite(recipe);
  }

  onRecipeClick(id: string) {
    this.router.navigate(['/recipe', id]);
  }
}
