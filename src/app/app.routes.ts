import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome-page.component';
import { CreateMealComponent } from './pages/create-meal.component';
import { ResultsListComponent } from './pages/results-list.component';
import { RecipeDetailComponent } from './pages/recipe-detail.component';
import { FavoritesPageComponent } from './pages/favorites-page.component';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'create', component: CreateMealComponent },
  { path: 'results', component: ResultsListComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'favorites', component: FavoritesPageComponent },
  { path: '**', redirectTo: '' },
];
