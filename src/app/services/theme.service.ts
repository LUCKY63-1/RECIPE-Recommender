import { Injectable, signal, Renderer2, Inject, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<'light' | 'dark'>('light');
  public theme = this._theme.asReadonly();
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(storedTheme ?? (prefersDark ? 'dark' : 'light'));
  }

  setTheme(theme: 'light' | 'dark') {
    console.log(`ThemeService: Setting theme to ${theme}`);
    this._theme.set(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      this.renderer.addClass(this.document.body, 'dark-theme');
      console.log(`ThemeService: Added 'dark-theme' class to body. Body classes: ${this.document.body.className}`);
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
      console.log(`ThemeService: Removed 'dark-theme' class from body. Body classes: ${this.document.body.className}`);
    }
  }

  toggleTheme() {
    this.setTheme(this._theme() === 'light' ? 'dark' : 'light');
  }
}
