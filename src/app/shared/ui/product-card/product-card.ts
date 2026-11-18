import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../data-access/models';
import { InViewport } from '../in-viewport/in-viewport';
import { Price } from '../price/price';
import { soldCountLabel } from './product-card.utils';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Price, InViewport],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Emitted once, the first time the card becomes visible. Parents decide how to track it. */
  readonly impression = output<void>();
  readonly opened = output<void>();

  private impressionSent = false;

  protected readonly fastDelivery = computed(() =>
    this.product().tags.some((tag) => tag.type === 'fast-delivery'),
  );
  /** Fast delivery gets its own badge, so it is excluded from the small tag row. */
  protected readonly tags = computed(() =>
    this.product().tags.filter((tag) => tag.type !== 'fast-delivery'),
  );
  protected readonly soldLabel = computed(() => soldCountLabel(this.product().soldCount));
  protected readonly ratingPercent = computed(() => (this.product().rating / 5) * 100);

  protected onVisible(visible: boolean): void {
    if (visible && !this.impressionSent) {
      this.impressionSent = true;
      this.impression.emit();
    }
  }
}
