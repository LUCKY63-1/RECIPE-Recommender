import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="welcome-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate-fade-in-up">
            {{ 'welcome.title' | translate }}
          </h1>
          <p class="hero-subtitle animate-fade-in-up delay-200">
            {{ 'welcome.subtitle' | translate }}
          </p>
          <button class="btn btn-primary btn-lg animate-fade-in-up delay-400" (click)="start()">
            {{ 'welcome.getStarted' | translate }}
          </button>
        </div>
      </div>

      <div class="features-section container my-5 mb-5">
        <h2 class="text-center mb-4 animate-fade-in-up">{{ 'welcome.howItWorks' | translate }}</h2>

        <div id="howItWorksCarousel" class="carousel slide animate-fade-in-up" data-bs-ride="carousel" data-bs-interval="4000" data-bs-pause="hover">
          <div class="carousel-inner text-center">
            <div class="carousel-item active">
              <i class="bi bi-basket-fill feature-icon d-block mb-3"></i>
              <h3>{{ 'welcome.addIngredients' | translate }}</h3>
              <p>{{ 'welcome.addIngredientsDesc' | translate }}</p>
            </div>
            <div class="carousel-item">
              <i class="bi bi-lightbulb-fill feature-icon d-block mb-3"></i>
              <h3>{{ 'welcome.getSuggestions' | translate }}</h3>
              <p>{{ 'welcome.getSuggestionsDesc' | translate }}</p>
            </div>
            <div class="carousel-item">
              <i class="bi bi-book-fill feature-icon d-block mb-3"></i>
              <h3>{{ 'welcome.cookEnjoy' | translate }}</h3>
              <p>{{ 'welcome.cookEnjoyDesc' | translate }}</p>
            </div>
          </div>

          <button class="carousel-control-prev" type="button" data-bs-target="#howItWorksCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#howItWorksCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <footer class="app-footer py-4 mt-5">
        <div class="container text-center text-muted">
          <p>{{ 'welcome.copyright' | translate }}</p>
          <p>
            <a href="#" class="text-muted">{{ 'welcome.privacyPolicy' | translate }}</a> |
            <a href="#" class="text-muted">{{ 'welcome.termsOfService' | translate }}</a>
          </p>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./welcome-page.component.css'], // Add a new stylesheet for custom styles
})
export class WelcomePageComponent {
  constructor(private router: Router) {}

  start() {
    this.router.navigate(['/create']);
  }
}
