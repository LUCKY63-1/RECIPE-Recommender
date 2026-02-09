import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RecipeSuggestion } from '../models/recipes';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-share-recipe-card',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="share-modal-overlay" *ngIf="visible" (click)="closeModal($event)">
      <div class="share-modal" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close()">
          <i class="bi bi-x-lg"></i>
        </button>
        
        <h3 class="modal-title">Share Recipe</h3>
        
        <div class="card-preview-wrapper">
          <div #shareCard class="share-card">
            <div class="card-bg-pattern"></div>
            <div class="card-content">
              <div class="brand-tag">RecipeRec</div>
              
              <div class="recipe-header">
                <h2 class="recipe-title">{{ recipe?.title }}</h2>
                <p class="recipe-desc">{{ recipe?.shortDescription }}</p>
              </div>
              
              <div class="recipe-meta">
                <div class="meta-item">
                  <i class="bi bi-clock-fill"></i>
                  <span>{{ recipe?.estimatedTimeMinutes }} min</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-bar-chart-fill"></i>
                  <span class="capitalize">{{ recipe?.difficulty }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-globe2"></i>
                  <span>{{ recipe?.cuisineRegion }}</span>
                </div>
              </div>
              
              <div class="ingredients-preview">
                <h4>Key Ingredients</h4>
                <div class="ingredients-grid">
                  <span *ngFor="let ing of getTopIngredients()" class="ingredient-tag">
                    {{ ing.name }}
                  </span>
                </div>
              </div>
              
              <div class="nutrition-bar" *ngIf="recipe?.nutrition as n">
                <div class="nutrition-item">
                  <span class="value">{{ n.calories }}</span>
                  <span class="label">kcal</span>
                </div>
                <div class="nutrition-item">
                  <span class="value">{{ n.protein }}g</span>
                  <span class="label">protein</span>
                </div>
                <div class="nutrition-item">
                  <span class="value">{{ n.carbs }}g</span>
                  <span class="label">carbs</span>
                </div>
                <div class="nutrition-item">
                  <span class="value">{{ n.fat }}g</span>
                  <span class="label">fat</span>
                </div>
              </div>
              
              <div class="card-footer">
                <div class="tags-row">
                  <span *ngIf="recipe?.isVegetarian" class="veg-badge">
                    <i class="bi bi-leaf-fill"></i> Vegetarian
                  </span>
                  <span *ngFor="let tag of getTopTags()" class="tag-badge">{{ tag }}</span>
                </div>
                <div class="cta">Scan to explore recipe</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="download-btn" (click)="downloadCard()" [disabled]="isDownloading">
            <i class="bi bi-download me-2"></i>
            {{ isDownloading ? 'Generating...' : 'Download Image' }}
          </button>
          <button class="share-native-btn" (click)="shareNative()" *ngIf="canShare">
            <i class="bi bi-share me-2"></i>
            Share
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .share-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .share-modal {
      background: #1a1a2e;
      border-radius: 24px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    .modal-title {
      color: #fff;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem;
      margin-bottom: 24px;
      text-align: center;
    }

    .card-preview-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .share-card {
      width: 400px;
      height: 400px;
      background: linear-gradient(145deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    }

    .card-bg-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 30%);
      pointer-events: none;
    }

    .card-content {
      position: relative;
      z-index: 1;
      padding: 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: #fff;
    }

    .brand-tag {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.9;
      margin-bottom: 12px;
    }

    .recipe-header {
      margin-bottom: 16px;
    }

    .recipe-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .recipe-desc {
      font-size: 0.8rem;
      opacity: 0.9;
      line-height: 1.4;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .recipe-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 10px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .meta-item i {
      font-size: 0.7rem;
    }

    .capitalize {
      text-transform: capitalize;
    }

    .ingredients-preview {
      flex: 1;
      margin-bottom: 12px;
    }

    .ingredients-preview h4 {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
      margin-bottom: 8px;
    }

    .ingredients-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .ingredient-tag {
      font-size: 0.7rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 4px 10px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .nutrition-bar {
      display: flex;
      justify-content: space-around;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 12px;
    }

    .nutrition-item {
      text-align: center;
    }

    .nutrition-item .value {
      display: block;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .nutrition-item .label {
      display: block;
      font-size: 0.6rem;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-footer {
      margin-top: auto;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .veg-badge {
      font-size: 0.65rem;
      background: rgba(34, 197, 94, 0.3);
      padding: 4px 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tag-badge {
      font-size: 0.65rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 4px 10px;
      border-radius: 12px;
    }

    .cta {
      font-size: 0.65rem;
      text-align: center;
      opacity: 0.7;
      letter-spacing: 0.5px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .download-btn, .share-native-btn {
      padding: 14px 28px;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
    }

    .download-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .download-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .download-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .share-native-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .share-native-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 480px) {
      .share-modal {
        padding: 20px;
      }

      .share-card {
        width: 320px;
        height: 320px;
      }

      .card-content {
        padding: 16px;
      }

      .recipe-title {
        font-size: 1.3rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ShareRecipeCardComponent {
  @Input() recipe: RecipeSuggestion | null | undefined = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @ViewChild('shareCard') shareCard!: ElementRef<HTMLDivElement>;

  isDownloading = false;
  canShare = typeof navigator !== 'undefined' && !!navigator.share;

  getTopIngredients() {
    return this.recipe?.ingredients?.slice(0, 6) || [];
  }

  getTopTags() {
    return this.recipe?.tags?.slice(0, 3) || [];
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('share-modal-overlay')) {
      this.close();
    }
  }

  async downloadCard() {
    if (!this.shareCard?.nativeElement) return;

    this.isDownloading = true;
    try {
      const canvas = await html2canvas(this.shareCard.nativeElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `${this.recipe?.title?.replace(/\s+/g, '-').toLowerCase() || 'recipe'}-share.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      this.isDownloading = false;
    }
  }

  async shareNative() {
    if (!this.shareCard?.nativeElement || !navigator.share) return;

    this.isDownloading = true;
    try {
      const canvas = await html2canvas(this.shareCard.nativeElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], `${this.recipe?.title || 'recipe'}.png`, { type: 'image/png' });

      await navigator.share({
        title: this.recipe?.title,
        text: `Check out this recipe: ${this.recipe?.title}`,
        files: [file]
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    } finally {
      this.isDownloading = false;
    }
  }
}