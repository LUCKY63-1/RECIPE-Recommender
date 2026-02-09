import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageSwitcherComponent } from './pages/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LanguageSwitcherComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('genieEffect', [
      state('idle', style({ transform: 'scale(1)', opacity: 1 })),
      state('animating', style({ transform: 'scale(0.1) translateY(-50px)', opacity: 0 })),
      transition('idle => animating', animate('0.5s ease-in')),
    ]),
  ],
})
export class App {
  themeService = inject(ThemeService);
  location = inject(Location);
  isAnimating = false;

  goBack() {
    this.isAnimating = true;
    setTimeout(() => {
      this.location.back();
      this.isAnimating = false;
    }, 500);
  }
}