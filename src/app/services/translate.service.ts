import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateServiceWrapper {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translate: TranslateService) {
    // Set default language
    this.translate.setDefaultLang('en');

    // Load saved language from localStorage or use default
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.useLanguage(savedLanguage);
  }

  /**
   * Sets the language for the application
   * @param lang The language code to set (e.g., 'en', 'hi', 'mr')
   */
  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguageSubject.next(lang);
    // Persist language preference (you can implement localStorage here if needed)
    localStorage.setItem('language', lang);
  }

  /**
   * Gets the current language
   * @returns The current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Gets the current language as an observable
   * @returns Observable of the current language
   */
  getCurrentLanguage$(): Observable<string> {
    return this.currentLanguage$;
  }

  /**
   * Uses a language (alias for setLanguage for compatibility)
   * @param lang The language code to use
   */
  useLanguage(lang: string): void {
    this.setLanguage(lang);
  }

  /**
   * Gets the translated value of a key
   * @param key The translation key
   * @param interpolateParams Optional parameters for interpolation
   * @returns Observable of the translated string
   */
  getTranslation(key: string | string[], interpolateParams?: any): Observable<string | any> {
    return this.translate.get(key, interpolateParams);
  }

  /**
   * Gets the instant translated value of a key (synchronous)
   * @param key The translation key
   * @param interpolateParams Optional parameters for interpolation
   * @returns The translated string
   */
  getInstantTranslation(key: string | string[], interpolateParams?: any): string | any {
    return this.translate.instant(key, interpolateParams);
  }

  /**
   * Gets the default language
   * @returns The default language code
   */
  getDefaultLanguage(): string {
    return this.translate.getDefaultLang() || 'en';
  }

  /**
   * Gets the browser language if available
   * @returns The browser language or undefined
   */
  getBrowserLanguage(): string | undefined {
    return this.translate.getBrowserLang();
  }

  /**
   * Translates dynamic recipe terms using mappings
   * @param term The term to translate
   * @param category The category of the term ('ingredients', 'methods', 'units')
   * @returns The translated term or the original term if no translation found
   */
  translateDynamicTerm(term: string, category: 'ingredients' | 'methods' | 'units'): string {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === 'en') {
      return term; // English is the base language
    }

    const translationKey = `mappings.${category}.${term.toLowerCase()}`;
    const translated = this.getInstantTranslation(translationKey);
    return translated !== translationKey ? translated : term;
  }

  /**
   * Translates a list of dynamic terms
   * @param terms Array of terms to translate
   * @param category The category of the terms
   * @returns Array of translated terms
   */
  translateDynamicTerms(terms: string[], category: 'ingredients' | 'methods' | 'units'): string[] {
    return terms.map(term => this.translateDynamicTerm(term, category));
  }
}