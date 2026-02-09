import { Pipe, PipeTransform } from '@angular/core';
import { TranslateServiceWrapper } from '../services/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: TranslateServiceWrapper) {}

  transform(key: string, interpolateParams?: any): string {
    try {
      const translated = this.translateService.getInstantTranslation(key, interpolateParams);
      // If translation returns the key itself, it means missing translation
      if (translated === key && interpolateParams) {
        return key; // fallback
      }
      return translated;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key; // fallback to key on error
    }
  }
}