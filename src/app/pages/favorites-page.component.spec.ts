import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FavoritesPageComponent } from './favorites-page.component';
import { FavoritesService } from '../services/favorites.service';
import { NgIf, NgFor } from '@angular/common';

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;

  beforeEach(async () => {
    const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService', ['favorites', 'isFavorite']);

    await TestBed.configureTestingModule({
      imports: [
        FavoritesPageComponent,
        NgIf,
        NgFor,
        RouterTestingModule
      ],
      providers: [
        { provide: FavoritesService, useValue: favoritesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display no favorites when favorites array is empty', () => {
    favoritesService.favorites.and.returnValue([]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const noFavoritesElement = compiled.querySelector('.text-center');
    expect(noFavoritesElement).toBeTruthy();
    expect(noFavoritesElement?.textContent).toContain('No favorite recipes yet');
  });

  it('should display favorite recipes when available', () => {
    const mockFavorites = [
      {
        id: '1',
        title: 'Favorite Recipe 1',
        shortDescription: 'A delicious favorite recipe',
        cuisineRegion: 'Italian',
        isVegetarian: true,
        tags: ['pasta', 'italian'],
        estimatedTimeMinutes: 30,
        difficulty: 'easy' as const,
        ingredients: [],
        steps: [],
        tips: [],
        servingSize: 4
      },
      {
        id: '2',
        title: 'Favorite Recipe 2',
        shortDescription: 'Another great favorite',
        cuisineRegion: 'Mexican',
        isVegetarian: false,
        tags: ['tacos', 'mexican'],
        estimatedTimeMinutes: 45,
        difficulty: 'medium' as const,
        ingredients: [],
        steps: [],
        tips: [],
        servingSize: 6
      }
    ];
    
    favoritesService.favorites.and.returnValue(mockFavorites);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const recipeCards = compiled.querySelectorAll('.favorite-card');
    expect(recipeCards.length).toBe(2);
    expect(recipeCards[0]?.textContent).toContain('Favorite Recipe 1');
    expect(recipeCards[1]?.textContent).toContain('Favorite Recipe 2');
  });

  it('should display heart as filled for favorite recipes', () => {
    const mockFavorites = [
      {
        id: '1',
        title: 'Favorite Recipe',
        shortDescription: 'A delicious favorite recipe',
        cuisineRegion: 'Italian',
        isVegetarian: true,
        tags: ['pasta', 'italian'],
        estimatedTimeMinutes: 30,
        difficulty: 'easy' as const,
        ingredients: [],
        steps: [],
        tips: [],
        servingSize: 4
      }
    ];
    
    favoritesService.favorites.and.returnValue(mockFavorites);
    favoritesService.isFavorite.and.returnValue(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const heartIcon = compiled.querySelector('.bi-heart-fill');
    expect(heartIcon).toBeTruthy();
    expect(heartIcon?.classList.contains('text-danger')).toBe(true);
  });

  it('should have back to home button', () => {
    favoritesService.favorites.and.returnValue([]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector('a[routerLink="/"]');
    expect(backButton).toBeTruthy();
    expect(backButton?.getAttribute('routerLink')).toBe('/');
    expect(backButton?.textContent).toContain('← Back to Home');
  });
});