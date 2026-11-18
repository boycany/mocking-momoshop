import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogApi } from '../../../data-access/catalog.api';
import { TrackingService } from '../../../shared/observability/tracking';
import { ProductRailSection } from '../../../data-access/models';
import { Carousel } from '../../../shared/ui/carousel/carousel';
import { LoadError } from '../../../shared/ui/load-error/load-error';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductCardSkeleton } from '../../../shared/ui/product-card/product-card-skeleton';

@Component({
  selector: 'app-product-rail',
  imports: [RouterLink, Carousel, LoadError, ProductCard, ProductCardSkeleton],
  template: `
    @let data = section();
    <section class="page-container rail">
      <header>
        <h2>{{ data.title }}</h2>
        @if (data.moreLink; as more) {
          <a [routerLink]="more.commands" [queryParams]="more.queryParams">看更多 ›</a>
        }
      </header>

      @if (products.error()) {
        <app-load-error (retry)="products.reload()" />
      } @else if (products.hasValue()) {
        <app-carousel>
          @for (product of products.value(); track product.id) {
            <app-product-card
              class="item"
              [product]="product"
              (impression)="trackProduct('product_impression', product.id, $index)"
              (opened)="trackProduct('product_click', product.id, $index)"
            />
          }
        </app-carousel>
      } @else {
        <div class="skeletons">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <app-product-card-skeleton class="item" />
          }
        </div>
      }
    </section>
  `,
  styles: `
    .rail {
      padding: 20px 0;
    }
    header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    h2 {
      margin: 0;
      font-size: 24px;
    }
    header a {
      color: var(--momo-primary);
    }
    .item {
      width: 224px;
    }
    .skeletons {
      display: flex;
      gap: 16px;
    }
  `,
})
export class ProductRail {
  private readonly catalog = inject(CatalogApi);
  private readonly tracking = inject(TrackingService);

  readonly section = input.required<ProductRailSection>();

  /** Each rail fetches its own products, so deferred rails cost nothing until they scroll into view. */
  protected readonly products = rxResource({
    params: () => this.section().productIds,
    stream: ({ params }) => this.catalog.getProductsByIds(params),
  });

  protected trackProduct(
    type: 'product_impression' | 'product_click',
    productId: string,
    index: number,
  ): void {
    this.tracking.track({ type, productId, list: this.section().title, position: index + 1 });
  }
}
