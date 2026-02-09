import { Component, OnInit, effect } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { filter } from 'rxjs/operators';
import { AiRecipeService } from '../services/ai-recipe.service';

interface BreadcrumbItem {
  label: string;
  route: string;
  active: boolean;
  progressStep: number;
  state: 'completed' | 'current' | 'pending';
  isTranslationKey: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslatePipe],
  template: `
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li
          *ngFor="let item of breadcrumbs; let last = last"
          class="breadcrumb-item"
          [class.active]="item.active"
        >
          <a
            *ngIf="!item.active"
            [routerLink]="item.route"
            class="breadcrumb-link"
          >
            <ng-container *ngIf="item.isTranslationKey">{{ item.label | translate }}</ng-container>
            <ng-container *ngIf="!item.isTranslationKey">{{ item.label }}</ng-container>
          </a>
          <span *ngIf="item.active" class="breadcrumb-text">
            <ng-container *ngIf="item.isTranslationKey">{{ item.label | translate }}</ng-container>
            <ng-container *ngIf="!item.isTranslationKey">{{ item.label }}</ng-container>
          </span>
        </li>
      </ol>
    </nav>
  `,
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  private routeMap: { [key: string]: BreadcrumbItem } = {
    '/': {
      label: 'common.home',
      route: '/',
      active: false,
      progressStep: 1,
      state: 'pending',
      isTranslationKey: true
    },
    '/create': {
      label: 'createMeal.title',
      route: '/create',
      active: false,
      progressStep: 2,
      state: 'pending',
      isTranslationKey: true
    },
    '/results': {
      label: 'results.title',
      route: '/results',
      active: false,
      progressStep: 3,
      state: 'pending',
      isTranslationKey: true
    },
    '/recipe/': {
      label: 'Recipe Details',
      route: '',
      active: false,
      progressStep: 4,
      state: 'pending',
      isTranslationKey: false
    }
  };

  constructor(private router: Router, private aiService: AiRecipeService) {
    // React to recipe data changes
    effect(() => {
      const results = this.aiService.getLastResults();
      if (results && this.router.url.includes('/recipe/')) {
        this.updateBreadcrumbs();
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  ngOnInit() {
    this.updateBreadcrumbs();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs() {
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/').filter(segment => segment);

    this.breadcrumbs = [];

    // Always include Home
    this.breadcrumbs.push({
      ...this.routeMap['/'],
      active: currentUrl === '/',
      state: currentUrl === '/' ? 'current' : 'pending'
    });

    // Build breadcrumbs based on flow
    if (urlSegments.length > 0) {
      const flowRoutes = ['create', 'results'];
      let currentStepIndex = -1;

      // Determine current step
      if (currentUrl === '/') {
        currentStepIndex = 0;
      } else if (currentUrl.startsWith('/create')) {
        currentStepIndex = 1;
      } else if (currentUrl.startsWith('/results')) {
        currentStepIndex = 2;
      } else if (currentUrl.includes('/recipe/')) {
        currentStepIndex = 3;
      }

      for (let i = 1; i <= flowRoutes.length; i++) {
        const segment = flowRoutes[i - 1];
        const route = '/' + segment;
        const isCompleted = i < currentStepIndex;
        const isCurrent = i === currentStepIndex;

        this.breadcrumbs.push({
          ...this.routeMap[route],
          active: isCurrent,
          state: isCompleted ? 'completed' : (isCurrent ? 'current' : 'pending'),
          route: route
        });
      }

      // Handle recipe detail
      if (currentUrl.includes('/recipe/')) {
        // Add results step if not already present
        if (!this.breadcrumbs.some(b => b.route === '/results')) {
          this.breadcrumbs.push({
            ...this.routeMap['/results'],
            active: false,
            route: '/results',
            state: 'completed'
          });
        }

        // Get recipe ID from URL and fetch actual title
        const recipeId = urlSegments[urlSegments.length - 1];
        const recipe = this.aiService.getRecipeById(recipeId);
        const recipeTitle = recipe?.title || 'Recipe Details';

        this.breadcrumbs.push({
          label: recipeTitle,
          route: currentUrl,
          active: true,
          progressStep: 4,
          state: 'current',
          isTranslationKey: false
        });
      }
    }

    // Update home state if not active
    if (currentUrl !== '/') {
      const homeIndex = this.breadcrumbs.findIndex(b => b.route === '/');
      if (homeIndex >= 0) {
        this.breadcrumbs[homeIndex].state = 'completed';
      }
    }
  }
}