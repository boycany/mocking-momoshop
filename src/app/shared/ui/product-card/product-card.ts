import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../data-access/models';
import { Price } from '../price/price';
import { soldCountLabel } from './product-card.utils';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Price],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();

  protected readonly fastDelivery = computed(() =>
    this.product().tags.some((tag) => tag.type === 'fast-delivery'),
  );
  /** Fast delivery gets its own badge, so it is excluded from the small tag row. */
  protected readonly tags = computed(() =>
    this.product().tags.filter((tag) => tag.type !== 'fast-delivery'),
  );
  protected readonly soldLabel = computed(() => soldCountLabel(this.product().soldCount));
  protected readonly ratingPercent = computed(() => (this.product().rating / 5) * 100);
}
