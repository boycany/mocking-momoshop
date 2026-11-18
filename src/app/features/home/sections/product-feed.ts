import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap, tap } from 'rxjs';
import { CatalogApi } from '../../../data-access/catalog.api';
import { Product, ProductFeedSection } from '../../../data-access/models';
import { InViewport } from '../../../shared/ui/in-viewport/in-viewport';
import { LoadError } from '../../../shared/ui/load-error/load-error';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductCardSkeleton } from '../../../shared/ui/product-card/product-card-skeleton';

/** `auto` comes from scrolling; `initial` and `manual` start a new round of auto-loading. */
type LoadTrigger = 'initial' | 'auto' | 'manual';

/**
 * Infinite-scroll wall, matching the real site: each round loads one batch, then auto-loads
 * `autoLoadPerRound` more batches on scroll, then waits for the "看更多" button to start the next round.
 */
@Component({
  selector: 'app-product-feed',
  imports: [InViewport, LoadError, ProductCard, ProductCardSkeleton],
  templateUrl: './product-feed.html',
  styleUrl: './product-feed.scss',
})
export class ProductFeed {
  private readonly catalog = inject(CatalogApi);

  readonly section = input.required<ProductFeedSection>();

  protected readonly items = signal<readonly Product[]>([]);
  protected readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  private readonly total = signal<number | null>(null);
  private readonly autoLoadsThisRound = signal(0);
  private readonly sentinelVisible = signal(false);
  private lastTrigger: LoadTrigger = 'initial';

  protected readonly hasMore = computed(() => {
    const total = this.total();
    return total === null || this.items().length < total;
  });
  private readonly canAutoLoad = computed(
    () => this.hasMore() && this.autoLoadsThisRound() < this.section().autoLoadPerRound,
  );
  /** The button appears once auto-loading for this round is used up (or the feed is exhausted). */
  protected readonly showButton = computed(() => this.total() !== null && !this.canAutoLoad());

  private readonly requests = new Subject<LoadTrigger>();

  constructor() {
    this.requests
      .pipe(
        // Ignore triggers while a batch is in flight, so a flickering sentinel cannot double-load.
        exhaustMap((trigger) => {
          this.lastTrigger = trigger;
          this.status.set('loading');
          return this.catalog
            .getRecommendations({ offset: this.items().length, limit: this.section().pageSize })
            .pipe(
              tap((page) => {
                this.items.update((items) => [...items, ...page.items]);
                this.total.set(page.total);
                this.autoLoadsThisRound.update((count) => (trigger === 'auto' ? count + 1 : 0));
                this.status.set('idle');
              }),
              catchError(() => {
                this.status.set('error');
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    // Decide when to load automatically: the first batch, then whenever the sentinel is visible
    // and this round still has auto-loads left. Re-runs after each batch, so it keeps going while
    // the sentinel stays on screen.
    effect(() => {
      if (this.status() !== 'idle') {
        return;
      }
      if (this.total() === null) {
        untracked(() => this.requests.next('initial'));
      } else if (this.sentinelVisible() && this.canAutoLoad()) {
        untracked(() => this.requests.next('auto'));
      }
    });
  }

  protected onSentinelVisible(visible: boolean): void {
    this.sentinelVisible.set(visible);
  }

  protected loadMore(): void {
    this.requests.next('manual');
  }

  protected retry(): void {
    this.requests.next(this.lastTrigger);
  }
}
