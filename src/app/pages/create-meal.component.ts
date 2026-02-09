import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiRecipeService } from '../services/ai-recipe.service';
import { PreferencesService } from '../services/preferences.service';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { BreadcrumbComponent } from '../components/breadcrumb.component';

@Component({
  selector: 'app-create-meal',
  standalone: true,
  imports: [FormsModule, NgIf, TranslatePipe, BreadcrumbComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container mt-5">
    <app-breadcrumb></app-breadcrumb>
      <div *ngIf="aiService.isLoading()" class="d-flex justify-content-center align-items-center mb-4">
        <div class="text-center">
          <dotlottie-wc src="https://lottie.host/b8d6b5bb-7da7-4d8d-99e4-1ffc5a0da9b0/LN3A7SerUe.lottie" style="width: 300px;height: 300px" autoplay loop></dotlottie-wc>
          <p class="mt-3 text-muted fw-medium">{{ 'createMeal.loadingMessage' | translate }}</p>
        </div>
      </div>

      <div class="card shadow-sm animate-fade-in" *ngIf="!aiService.isLoading()">
        <div class="card-body">
          <h2 class="card-title fw-semibold mb-3">{{ 'createMeal.title' | translate }}</h2>
          <p class="card-text text-muted mb-4">
            {{ 'createMeal.subtitle' | translate }}
          </p>

          <div class="mb-3">
            <label for="ingredients" class="form-label">{{ 'createMeal.ingredientsLabel' | translate }}</label>
            <input
              type="text"
              id="ingredients"
              class="form-control"
              [placeholder]="'createMeal.ingredientsPlaceholder' | translate"
              [(ngModel)]="ingredientsInput"
              (input)="onIngredientsInput()"
              [class.is-invalid]="ingredientsInput.trim() === '' && showIngredientError"
            />
            <div class="invalid-feedback" *ngIf="showIngredientError">
              {{ 'createMeal.ingredientsError' | translate }}
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md">
              <label for="diet" class="form-label">{{ 'createMeal.dietLabel' | translate }}</label>
              <select id="diet" class="form-select" [(ngModel)]="diet">
                <option value="veg">{{ 'createMeal.dietOptions.veg' | translate }}</option>
                <option value="non-veg">{{ 'createMeal.dietOptions.nonVeg' | translate }}</option>
                <option value="vegan">{{ 'createMeal.dietOptions.vegan' | translate }}</option>
                <option value="jain">{{ 'createMeal.dietOptions.jain' | translate }}</option>
                <option value="keto">{{ 'createMeal.dietOptions.keto' | translate }}</option>
              </select>
            </div>

            <div class="col-md">
              <label for="spiceLevel" class="form-label">{{ 'createMeal.spiceLevelLabel' | translate }}</label>
              <select id="spiceLevel" class="form-select" [(ngModel)]="spiceLevel">
                <option value="mild">{{ 'createMeal.spiceLevelOptions.mild' | translate }}</option>
                <option value="medium">{{ 'createMeal.spiceLevelOptions.medium' | translate }}</option>
                <option value="hot">{{ 'createMeal.spiceLevelOptions.hot' | translate }}</option>
              </select>
            </div>

            <div class="col-md">
              <label for="timeLimit" class="form-label">{{ 'createMeal.timeLabel' | translate }}</label>
              <input
                type="number"
                id="timeLimit"
                min="5"
                class="form-control"
                [(ngModel)]="timeLimit"
              />
            </div>
          </div>

          <button class="btn btn-primary w-100" (click)="generate()">
            {{ 'createMeal.generateButton' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./create-meal.component.css'],
})
export class CreateMealComponent {
  ingredientsInput = '';
  diet: any = 'veg';
  spiceLevel: any = 'medium';
  timeLimit: number | null = 20;
  showIngredientError = false;

  constructor(
    private readonly router: Router,
    public readonly aiService: AiRecipeService,
    private readonly preferences: PreferencesService,
  ) {}

  onIngredientsInput() {
    if (this.showIngredientError && this.ingredientsInput.trim() !== '') {
      this.showIngredientError = false;
    }
  }

  generate() {
    const ingredients = this.ingredientsInput
      .split(',')
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean);

    // Validate that ingredients are provided
    if (ingredients.length === 0) {
      this.showIngredientError = true;
      return;
    }

    this.showIngredientError = false;
    this.preferences.setDiet(this.diet);
    this.preferences.setSpiceLevel(this.spiceLevel);

    console.log('Ingredients input:', this.ingredientsInput, 'Parsed:', ingredients);

    this.aiService.generateRecipes({
      ingredients,
      diet: this.diet,
      spiceLevel: this.spiceLevel,
      timeLimitMinutes: this.timeLimit ?? undefined,
    });

    this.router.navigate(['/results']);
  }
}