import { Component, computed, effect, inject, input, linkedSignal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CatalogApi } from '../../data-access/catalog.api';
import { ProductNotFoundError } from '../../data-access/catalog.errors';
import { CartStore, SelectedSpecs } from '../../data-access/stores/cart.store';
import { RecentlyViewedStore } from '../../data-access/stores/recently-viewed.store';
import { TrackingService } from '../../shared/observability/tracking';
import { LoadError } from '../../shared/ui/load-error/load-error';
import { Price } from '../../shared/ui/price/price';

@Component({
  selector: 'app-goods-page',
  imports: [RouterLink, LoadError, Price],
  templateUrl: './goods-page.html',
  styleUrl: './goods-page.scss',
})
export class GoodsPage {
  private readonly catalog = inject(CatalogApi);
  private readonly cart = inject(CartStore);
  private readonly recentlyViewed = inject(RecentlyViewedStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly title = inject(Title);
  private readonly tracking = inject(TrackingService);

  /** Bound from the `:id` route param via withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly product = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.catalog.getProduct(params),
  });
  private readonly categories = rxResource({ stream: () => this.catalog.getCategories() });

  /**
   * Resource.value() throws while the resource is in an error state, so derived state reads
   * through this guard instead of the resource directly.
   */
  private readonly loadedProduct = computed(() =>
    this.product.hasValue() ? this.product.value() : undefined,
  );

  protected readonly notFound = computed(
    () => this.product.error() instanceof ProductNotFoundError,
  );
  protected readonly categoryName = computed(() => {
    const categoryId = this.loadedProduct()?.categoryId;
    return this.categories.value()?.find((category) => category.id === categoryId)?.name ?? '';
  });

  // Per-product UI state: reset automatically when navigating to another product.
  protected readonly activeImage = linkedSignal({ source: this.id, computation: () => 0 });
  protected readonly selectedSpecs = linkedSignal<string, SelectedSpecs>({
    source: this.id,
    computation: () => ({}),
  });
  protected readonly quantity = linkedSignal({ source: this.id, computation: () => 1 });
  protected readonly quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  protected readonly specsComplete = computed(() => {
    const product = this.loadedProduct();
    const selected = this.selectedSpecs();
    return !!product && product.specs.every((group) => !!selected[group.name]);
  });

  protected readonly fastDelivery = computed(
    () => this.loadedProduct()?.tags.some((tag) => tag.type === 'fast-delivery') ?? false,
  );

  constructor() {
    // Record only successfully loaded products, so removed items never enter the history.
    // untracked: record() reads and writes the store, which must not become a dependency here.
    effect(() => {
      const product = this.loadedProduct();
      if (product) {
        untracked(() => this.recentlyViewed.record(product));
      }
    });
    effect(() => {
      const product = this.loadedProduct();
      if (product) {
        this.title.setTitle(`${product.name} | momo購物網`);
      }
    });
  }

  protected selectSpec(group: string, option: string): void {
    this.selectedSpecs.update((specs) => ({ ...specs, [group]: option }));
  }

  protected onQuantityChange(event: Event): void {
    this.quantity.set(Number((event.target as HTMLSelectElement).value));
  }

  protected addToCart(): void {
    const product = this.loadedProduct();
    if (!product || !this.specsComplete()) {
      return;
    }
    this.cart.add(product, this.selectedSpecs(), this.quantity());
    this.tracking.track({
      type: 'add_to_cart',
      productId: product.id,
      quantity: this.quantity(),
      price: product.price,
    });
    this.snackBar.open('已加入購物車', undefined, { duration: 2500 });
  }

  protected buyNow(): void {
    this.snackBar.open('結帳流程不在本次實作範圍內', undefined, { duration: 2500 });
  }
}
