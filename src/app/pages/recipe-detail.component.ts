import { Component, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AiRecipeService } from '../services/ai-recipe.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { BreadcrumbComponent } from '../components/breadcrumb.component';
import { RecipeReviewsComponent } from '../components/recipe-reviews.component';
import { NutritionChartComponent } from '../components/nutrition-chart.component';
import { ShareRecipeCardComponent } from '../components/share-recipe-card.component';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslatePipe, BreadcrumbComponent, RecipeReviewsComponent, NutritionChartComponent, ShareRecipeCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container mt-5">
    <app-breadcrumb></app-breadcrumb>
      <div *ngIf="aiService.isLoading()" class="d-flex justify-content-center align-items-center mb-4">
        <div class="text-center">
          <dotlottie-wc src="https://lottie.host/b8d6b5bb-7da7-4d8d-99e4-1ffc5a0da9b0/LN3A7SerUe.lottie" style="width: 300px;height: 300px" autoplay loop></dotlottie-wc>
          <p class="mt-3 text-muted fw-medium">{{ 'recipeDetail.enrichingRecipe' | translate }}</p>
        </div>
      </div>

      <div class="card shadow-sm" *ngIf="!aiService.isLoading() && recipe() as r; else notFound">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <a routerLink="/results" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i> {{ 'common.backToResults' | translate }}
            </a>
            <button class="btn btn-share" (click)="showShareModal = true">
              <i class="bi bi-share-fill me-2"></i> Share
            </button>
          </div>
          <h2 class="card-title fw-bold">{{ r.title }}</h2>
          <p class="card-text text-muted mb-4">{{ r.shortDescription }}</p>

          <div class="d-flex flex-wrap gap-2 mb-4">
            <span class="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">{{ r.cuisineRegion }}</span>
            <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle"><i class="bi bi-clock me-1"></i>{{ r.estimatedTimeMinutes }} min</span>
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle text-capitalize"><i class="bi bi-signal me-1"></i>{{ r.difficulty }}</span>
          </div>

          <h3 class="h4 fw-semibold mb-3">{{ 'common.ingredients' | translate }}</h3>
          <ul class="list-group list-group-flush mb-4">
            <li *ngFor="let ing of r.ingredients" class="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <i class="bi bi-check-circle-fill text-success me-2" *ngIf="ing.isFromUserKitchen"></i>
                <i class="bi bi-circle text-muted me-2" *ngIf="!ing.isFromUserKitchen"></i>
                {{ ing.quantity }} - {{ ing.name }}
              </span>
              <span *ngIf="ing.isFromUserKitchen" class="badge bg-success-subtle text-success-emphasis">In your kitchen</span>
            </li>
          </ul>

          <h3 class="h4 fw-semibold mb-3">{{ 'common.steps' | translate }}</h3>
          <ol class="list-group list-group-numbered mb-4">
            <li *ngFor="let step of r.steps" class="list-group-item">{{ step }}</li>
          </ol>

          <h3 class="h5 fw-semibold mb-2">{{ 'common.tipsFromChef' | translate }}</h3>
          <div class="alert alert-info">
            <p class="mb-2">
              <i class="bi bi-lightbulb me-2"></i>
              {{ 'recipeDetail.chefTipIntro' | translate:{title: r.title} }}
            </p>
            <ul class="mb-0 ps-4">
              <li *ngFor="let tip of r.tips">{{ tip }}</li>
            </ul>
          </div>

          <app-nutrition-chart [nutrition]="r.nutrition"></app-nutrition-chart>
          <app-recipe-reviews [recipeId]="id"></app-recipe-reviews>
        </div>
      </div>

      <ng-template #notFound>
        <div class="alert alert-danger mt-5" *ngIf="!aiService.isLoading()">
          <span>{{ 'recipeDetail.recipeNotFound' | translate }}</span>
        </div>
      </ng-template>
    </div>

    <app-share-recipe-card 
      [recipe]="recipe()" 
      [(visible)]="showShareModal">
    </app-share-recipe-card>
  `,
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent {
  id: string;
  showShareModal = false;

  recipe = computed(() => this.aiService.getRecipeById(this.id));

  constructor(
    private readonly route: ActivatedRoute,
    public readonly aiService: AiRecipeService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.aiService.fetchRecipeDetails(this.id);
  }
}