import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { discountLabel } from './price.utils';

@Component({
  selector: 'app-price',
  imports: [DecimalPipe],
  template: `
    <span class="price" [class.large]="size() === 'large'">
      <span class="current"><small>$</small>{{ price() | number }}</span>
      @if (originalPrice(); as original) {
        <s class="original">\${{ original | number }}</s>
      }
      @if (showDiscount() && discount(); as label) {
        <span class="discount">{{ label }}</span>
      }
    </span>
  `,
  styleUrl: './price.scss',
})
export class Price {
  readonly price = input.required<number>();
  readonly originalPrice = input<number | null>(null);
  readonly size = input<'normal' | 'large'>('normal');
  readonly showDiscount = input(false);

  protected readonly discount = computed(() => discountLabel(this.price(), this.originalPrice()));
}
