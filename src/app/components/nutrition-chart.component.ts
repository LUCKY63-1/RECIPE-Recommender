import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { NutritionalInfo } from '../models/recipes';

@Component({
  selector: 'app-nutrition-chart',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe],
  template: `
    <div class="nutrition-section" *ngIf="nutrition as n">
      <h3 class="nutrition-title">
        <i class="bi bi-pie-chart me-2"></i>Nutritional Analysis
        <span class="serving-note">(per serving)</span>
      </h3>
      
      <div class="nutrition-content">
        <div class="chart-container">
          <canvas #chartCanvas width="200" height="200"></canvas>
          <div class="chart-center">
            <span class="calories-value">{{ n.calories }}</span>
            <span class="calories-label">kcal</span>
          </div>
        </div>

        <div class="legend-container">
          <div class="legend-item" *ngFor="let item of macroData">
            <span class="legend-color" [style.background]="item.color"></span>
            <span class="legend-name">{{ item.name }}</span>
            <span class="legend-value">{{ item.value | number:'1.1-1' }}g</span>
            <span class="legend-percent">{{ item.percent | number:'1.0-0' }}%</span>
          </div>
        </div>
      </div>

      <div class="nutrition-details">
        <div class="detail-card">
          <i class="bi bi-fire"></i>
          <span class="detail-label">Calories</span>
          <span class="detail-value">{{ n.calories }}</span>
        </div>
        <div class="detail-card">
          <i class="bi bi-egg"></i>
          <span class="detail-label">Protein</span>
          <span class="detail-value">{{ n.protein }}g</span>
        </div>
        <div class="detail-card">
          <i class="bi bi-grain"></i>
          <span class="detail-label">Carbs</span>
          <span class="detail-value">{{ n.carbs }}g</span>
        </div>
        <div class="detail-card">
          <i class="bi bi-droplet"></i>
          <span class="detail-label">Fat</span>
          <span class="detail-value">{{ n.fat }}g</span>
        </div>
        <div class="detail-card">
          <i class="bi bi-leaf"></i>
          <span class="detail-label">Fiber</span>
          <span class="detail-value">{{ n.fiber }}g</span>
        </div>
        <div class="detail-card">
          <i class="bi bi-cup-straw"></i>
          <span class="detail-label">Sugar</span>
          <span class="detail-value">{{ n.sugar }}g</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nutrition-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--rc-surface);
      border-radius: var(--rc-radius-lg);
      border: 1px solid var(--rc-border-subtle);
    }
    .nutrition-title {
      color: var(--rc-heading);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .serving-note {
      font-size: 0.85rem;
      color: var(--rc-text-soft);
      font-weight: normal;
    }
    .nutrition-content {
      display: flex;
      gap: 2rem;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .chart-container {
      position: relative;
      width: 200px;
      height: 200px;
      flex-shrink: 0;
    }
    .chart-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .calories-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--rc-heading);
      line-height: 1;
    }
    .calories-label {
      font-size: 0.85rem;
      color: var(--rc-text-soft);
    }
    .legend-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .legend-name {
      flex: 1;
      color: var(--rc-text);
      font-weight: 500;
    }
    .legend-value {
      color: var(--rc-text-soft);
      font-size: 0.9rem;
      min-width: 50px;
      text-align: right;
    }
    .legend-percent {
      color: var(--rc-primary);
      font-weight: 600;
      font-size: 0.9rem;
      min-width: 40px;
      text-align: right;
    }
    .nutrition-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }
    .detail-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: var(--rc-hover-surface);
      border-radius: var(--rc-radius-md);
      text-align: center;
    }
    .detail-card i {
      font-size: 1.5rem;
      color: var(--rc-primary);
      margin-bottom: 0.5rem;
    }
    .detail-label {
      font-size: 0.8rem;
      color: var(--rc-text-soft);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--rc-heading);
    }
    @media (max-width: 576px) {
      .nutrition-content {
        flex-direction: column;
      }
      .nutrition-details {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `],
})
export class NutritionChartComponent implements OnChanges, AfterViewInit {
  @Input() nutrition: NutritionalInfo | undefined;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  macroData: { name: string; value: number; color: string; percent: number }[] = [];

  private colors = {
    protein: '#6366f1',
    carbs: '#22c55e',
    fat: '#f59e0b',
  };

  ngAfterViewInit() {
    this.updateChart();
  }

  ngOnChanges() {
    this.updateChart();
  }

  private updateChart() {
    if (!this.nutrition || !this.chartCanvas?.nativeElement) return;

    const total = this.nutrition.protein + this.nutrition.carbs + this.nutrition.fat;
    if (total === 0) return;

    this.macroData = [
      { name: 'Protein', value: this.nutrition.protein, color: this.colors.protein, percent: (this.nutrition.protein / total) * 100 },
      { name: 'Carbs', value: this.nutrition.carbs, color: this.colors.carbs, percent: (this.nutrition.carbs / total) * 100 },
      { name: 'Fat', value: this.nutrition.fat, color: this.colors.fat, percent: (this.nutrition.fat / total) * 100 },
    ];

    this.drawPieChart();
  }

  private drawPieChart() {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 95;
    const innerRadius = 60;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;

    this.macroData.forEach((item) => {
      const sliceAngle = (item.percent / 100) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });
  }
}