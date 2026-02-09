import { Injectable, signal } from '@angular/core';

export type DietPreference = 'veg' | 'non-veg' | 'vegan' | 'jain' | 'keto';
export type SpiceLevel = 'mild' | 'medium' | 'hot';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  diet = signal<DietPreference>('veg');
  spiceLevel = signal<SpiceLevel>('medium');
  avoidIngredients = signal<string[]>([]);

  setDiet(diet: DietPreference) {
    this.diet.set(diet);
  }

  setSpiceLevel(level: SpiceLevel) {
    this.spiceLevel.set(level);
  }

  setAvoidIngredients(list: string[]) {
    this.avoidIngredients.set(list);
  }
}
