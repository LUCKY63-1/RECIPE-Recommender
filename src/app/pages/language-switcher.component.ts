import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateServiceWrapper } from '../services/translate.service';
import { Subscription } from 'rxjs';

interface LanguageOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <select
        [value]="currentLanguage"
        (change)="onLanguageChange($event)"
        class="form-select form-select-sm">
        <option
          *ngFor="let lang of languages"
          [value]="lang.code"
          [selected]="lang.code === currentLanguage">
          {{ lang.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: inline-block;
    }

    .form-select {
      min-width: 120px;
      border-radius: 0.375rem;
      border: 1px solid #dee2e6;
      padding: 0.375rem 1.75rem 0.375rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px 12px;
      appearance: none;
    }

    .form-select:focus {
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  private translateService = inject(TranslateServiceWrapper);
  private languageSubscription: Subscription | null = null;

  currentLanguage = this.translateService.getCurrentLanguage();

  languages: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' }
  ];

  ngOnInit(): void {
    this.languageSubscription = this.translateService.getCurrentLanguage$().subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedLanguage = target.value;
    this.translateService.setLanguage(selectedLanguage);
    // No need to set this.currentLanguage here as it will be updated via subscription
  }
}