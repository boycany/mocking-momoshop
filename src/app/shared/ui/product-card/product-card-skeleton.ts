import { Component } from '@angular/core';

/** Placeholder with the same footprint as ProductCard, to avoid layout shift while loading. */
@Component({
  selector: 'app-product-card-skeleton',
  template: `
    <div class="block image"></div>
    <div class="block line"></div>
    <div class="block line short"></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .block {
      border-radius: 4px;
      background: linear-gradient(90deg, #eee 25%, #f6f6f6 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }
    .image {
      aspect-ratio: 1;
    }
    .line {
      height: 16px;
    }
    .short {
      width: 50%;
    }
    @keyframes shimmer {
      to {
        background-position: -200% 0;
      }
    }
  `,
})
export class ProductCardSkeleton {}
