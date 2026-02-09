import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../services/review.service';

@Component({
  selector: 'app-recipe-reviews',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  template: `
    <div class="reviews-section">
      <h3 class="reviews-title">
        <i class="bi bi-chat-quote me-2"></i>Ratings & Reviews
      </h3>

      <div class="stats-summary" *ngIf="reviewService.stats().totalReviews > 0">
        <div class="rating-display">
          <span class="avg-rating">{{ reviewService.stats().averageRating.toFixed(1) }}</span>
          <div class="stars-display">
            <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= Math.round(reviewService.stats().averageRating)">
              <i class="bi" [class.bi-star-fill]="star <= Math.round(reviewService.stats().averageRating)" [class.bi-star]="star > Math.round(reviewService.stats().averageRating)"></i>
            </span>
          </div>
          <span class="total-reviews">{{ reviewService.stats().totalReviews }} reviews</span>
        </div>
        <div class="rating-bars">
          <div *ngFor="let rating of [5,4,3,2,1]" class="rating-bar-row">
            <span class="bar-label">{{ rating }}</span>
            <div class="bar-container">
              <div class="bar-fill" [style.width.%]="getBarWidth(rating)"></div>
            </div>
            <span class="bar-count">{{ reviewService.stats().ratingCounts[rating] || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="review-form">
        <h4 class="form-title">Leave a Review</h4>
        <div class="star-input">
          <span *ngFor="let star of [1,2,3,4,5]" class="star-btn" [class.active]="star <= newRating" (click)="setRating(star)">
            <i class="bi" [class.bi-star-fill]="star <= newRating" [class.bi-star]="star > newRating"></i>
          </span>
        </div>
        <input type="text" class="form-control name-input" [(ngModel)]="userName" placeholder="Your name (optional)" maxlength="100">
        <textarea class="form-control review-textarea" [(ngModel)]="reviewText" placeholder="Share your thoughts about this recipe..." rows="3"></textarea>
        <button class="btn btn-submit" [disabled]="newRating === 0 || reviewService.isSubmitting()" (click)="submitReview()">
          <span *ngIf="reviewService.isSubmitting()">Submitting...</span>
          <span *ngIf="!reviewService.isSubmitting()"><i class="bi bi-send me-2"></i>Submit Review</span>
        </button>
        <p *ngIf="submitMessage" class="submit-message" [class.success]="submitSuccess" [class.error]="!submitSuccess">{{ submitMessage }}</p>
      </div>

      <div class="reviews-list" *ngIf="reviewService.reviews().length > 0">
        <div class="review-card" *ngFor="let review of reviewService.reviews()">
          <div class="review-header">
            <div class="reviewer-info">
              <span class="reviewer-avatar">{{ review.user_name.charAt(0).toUpperCase() }}</span>
              <span class="reviewer-name">{{ review.user_name }}</span>
            </div>
            <div class="review-meta">
              <span class="review-stars">
                <i *ngFor="let star of [1,2,3,4,5]" class="bi" [class.bi-star-fill]="star <= review.rating" [class.bi-star]="star > review.rating"></i>
              </span>
              <span class="review-date">{{ review.created_at | date:'mediumDate' }}</span>
            </div>
          </div>
          <p class="review-text" *ngIf="review.review_text">{{ review.review_text }}</p>
        </div>
      </div>

      <div class="no-reviews" *ngIf="!reviewService.isLoading() && reviewService.reviews().length === 0">
        <i class="bi bi-chat-dots"></i>
        <p>No reviews yet. Be the first to share your thoughts!</p>
      </div>
    </div>
  `,
  styles: [`
    .reviews-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--rc-surface);
      border-radius: var(--rc-radius-lg);
      border: 1px solid var(--rc-border-subtle);
    }
    .reviews-title {
      color: var(--rc-heading);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .stats-summary {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: var(--rc-hover-surface);
      border-radius: var(--rc-radius-md);
    }
    .rating-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
    }
    .avg-rating {
      font-size: 3rem;
      font-weight: 700;
      color: var(--rc-primary);
      line-height: 1;
    }
    .stars-display {
      margin: 0.5rem 0;
    }
    .star { color: #ffc107; font-size: 1.1rem; }
    .star.filled { color: #ffc107; }
    .total-reviews {
      font-size: 0.9rem;
      color: var(--rc-text-soft);
    }
    .rating-bars { flex: 1; }
    .rating-bar-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    .bar-label {
      width: 20px;
      text-align: right;
      font-size: 0.85rem;
      color: var(--rc-text-soft);
    }
    .bar-container {
      flex: 1;
      height: 8px;
      background: var(--rc-border-subtle);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffc107, #ff9800);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .bar-count {
      width: 30px;
      font-size: 0.85rem;
      color: var(--rc-text-soft);
    }
    .review-form {
      padding: 1.5rem;
      background: var(--rc-hover-surface);
      border-radius: var(--rc-radius-md);
      margin-bottom: 2rem;
    }
    .form-title {
      color: var(--rc-heading);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    .star-input {
      margin-bottom: 1rem;
    }
    .star-btn {
      font-size: 1.8rem;
      color: var(--rc-border-subtle);
      cursor: pointer;
      transition: transform 0.15s, color 0.15s;
    }
    .star-btn:hover { transform: scale(1.15); }
    .star-btn.active { color: #ffc107; }
    .name-input {
      margin-bottom: 0.75rem;
      background: var(--rc-surface);
      border: 1px solid var(--rc-border-subtle);
      color: var(--rc-text);
    }
    .review-textarea {
      margin-bottom: 1rem;
      background: var(--rc-surface);
      border: 1px solid var(--rc-border-subtle);
      color: var(--rc-text);
      resize: none;
    }
    .btn-submit {
      background: linear-gradient(135deg, var(--rc-primary), var(--rc-primary-dark, #4a6ac3));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--rc-radius-pill);
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .submit-message {
      margin-top: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--rc-radius-sm);
      font-size: 0.9rem;
    }
    .submit-message.success { color: #28a745; background: rgba(40,167,69,0.1); }
    .submit-message.error { color: #dc3545; background: rgba(220,53,69,0.1); }
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .review-card {
      padding: 1rem;
      background: var(--rc-hover-surface);
      border-radius: var(--rc-radius-md);
      border: 1px solid var(--rc-border-subtle);
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .reviewer-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--rc-primary), var(--rc-primary-dark, #4a6ac3));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .reviewer-name {
      font-weight: 500;
      color: var(--rc-text);
    }
    .review-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .review-stars {
      color: #ffc107;
      font-size: 0.9rem;
    }
    .review-date {
      font-size: 0.8rem;
      color: var(--rc-text-soft);
    }
    .review-text {
      color: var(--rc-text);
      line-height: 1.6;
      margin: 0;
    }
    .no-reviews {
      text-align: center;
      padding: 2rem;
      color: var(--rc-text-soft);
    }
    .no-reviews i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    @media (max-width: 576px) {
      .stats-summary { flex-direction: column; }
    }
  `],
})
export class RecipeReviewsComponent implements OnInit {
  @Input() recipeId!: string;

  newRating = 0;
  reviewText = '';
  userName = '';
  submitMessage = '';
  submitSuccess = false;
  Math = Math;

  constructor(public reviewService: ReviewService) {}

  ngOnInit() {
    if (this.recipeId) {
      this.reviewService.loadReviews(this.recipeId);
    }
  }

  setRating(rating: number) {
    this.newRating = rating;
  }

  getBarWidth(rating: number): number {
    const stats = this.reviewService.stats();
    if (stats.totalReviews === 0) return 0;
    return ((stats.ratingCounts[rating] || 0) / stats.totalReviews) * 100;
  }

  async submitReview() {
    if (this.newRating === 0) return;

    const success = await this.reviewService.submitReview(
      this.recipeId,
      this.newRating,
      this.reviewText,
      this.userName || 'Anonymous'
    );

    if (success) {
      this.submitMessage = 'Review submitted successfully!';
      this.submitSuccess = true;
      this.newRating = 0;
      this.reviewText = '';
      this.userName = '';
    } else {
      this.submitMessage = 'Failed to submit review. Please try again.';
      this.submitSuccess = false;
    }

    setTimeout(() => (this.submitMessage = ''), 3000);
  }
}
