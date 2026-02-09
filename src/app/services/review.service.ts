import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../environments/supabase.config';

export interface Review {
  id: string;
  recipe_id: string;
  user_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [key: number]: number };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private supabase: SupabaseClient;
  private readonly table = 'recipe_reviews';

  private readonly reviewsSignal = signal<Review[]>([]);
  private readonly statsSignal = signal<ReviewStats>({ averageRating: 0, totalReviews: 0, ratingCounts: {} });
  private readonly loadingSignal = signal<boolean>(false);
  private readonly submittingSignal = signal<boolean>(false);

  readonly reviews = computed(() => this.reviewsSignal());
  readonly stats = computed(() => this.statsSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly isSubmitting = computed(() => this.submittingSignal());

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async loadReviews(recipeId: string): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load reviews:', error.message);
        this.reviewsSignal.set([]);
        return;
      }

      const reviews = (data || []) as Review[];
      this.reviewsSignal.set(reviews);
      this.calculateStats(reviews);
    } catch (err) {
      console.error('Network error loading reviews:', err);
      this.reviewsSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private calculateStats(reviews: Review[]): void {
    if (reviews.length === 0) {
      this.statsSignal.set({ averageRating: 0, totalReviews: 0, ratingCounts: {} });
      return;
    }

    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    reviews.forEach((r) => {
      total += r.rating;
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    });

    this.statsSignal.set({
      averageRating: total / reviews.length,
      totalReviews: reviews.length,
      ratingCounts,
    });
  }

  async submitReview(recipeId: string, rating: number, reviewText: string, userName: string = 'Anonymous'): Promise<boolean> {
    this.submittingSignal.set(true);
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .insert({
          recipe_id: recipeId,
          rating,
          review_text: reviewText || null,
          user_name: userName,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Failed to submit review:', error.message);
        return false;
      }

      const newReview = data as Review;
      const currentReviews = [newReview, ...this.reviewsSignal()];
      this.reviewsSignal.set(currentReviews);
      this.calculateStats(currentReviews);
      return true;
    } catch (err) {
      console.error('Network error submitting review:', err);
      return false;
    } finally {
      this.submittingSignal.set(false);
    }
  }
}
