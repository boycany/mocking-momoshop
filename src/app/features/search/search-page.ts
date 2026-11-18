import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogApi } from '../../data-access/catalog.api';
import { TrackingService } from '../../shared/observability/tracking';
import { DEFAULT_PAGE_SIZE, SearchQuery, SortOption } from '../../data-access/models';
import { LoadError } from '../../shared/ui/load-error/load-error';
import { ProductCard } from '../../shared/ui/product-card/product-card';
import { ProductCardSkeleton } from '../../shared/ui/product-card/product-card-skeleton';
import { pageWindow, parsePage, parseSort } from './search-params';

const SORT_LABELS: Readonly<Record<SortOption, string>> = {
  relevance: '綜合排序',
  'price-asc': '價格低到高',
  'price-desc': '價格高到低',
  newest: '最新上架',
};

/**
 * Search results. Every criterion lives in the URL (ADR 0002): inputs are bound from query params,
 * and changing sort or page is plain navigation through links.
 */
@Component({
  selector: 'app-search-page',
  imports: [RouterLink, LoadError, ProductCard, ProductCardSkeleton],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  private readonly catalog = inject(CatalogApi);
  private readonly tracking = inject(TrackingService);

  readonly keyword = input<string>();
  readonly categoryId = input<string>();
  readonly sort = input<SortOption, string | undefined>('relevance', { transform: parseSort });
  readonly page = input<number, string | number | undefined>(1, { transform: parsePage });

  protected readonly sortOptions = Object.entries(SORT_LABELS) as [SortOption, string][];
  protected readonly suggestions = ['洗衣機', '耳機', '衛生紙', '保濕'];

  protected readonly query = computed<SearchQuery>(() => ({
    keyword: this.keyword()?.trim() ?? '',
    categoryId: this.categoryId() || undefined,
    sort: this.sort(),
    page: this.page(),
    pageSize: DEFAULT_PAGE_SIZE,
  }));

  /** Re-runs whenever the URL changes; switching criteria cancels the previous request. */
  protected readonly results = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.catalog.searchProducts(params),
  });
  private readonly categories = rxResource({ stream: () => this.catalog.getCategories() });

  protected readonly heading = computed(() => {
    const { keyword, categoryId } = this.query();
    if (keyword) {
      return `「${keyword}」搜尋結果`;
    }
    const category = this.categories.hasValue()
      ? this.categories.value().find((candidate) => candidate.id === categoryId)
      : undefined;
    return category?.name ?? '全部商品';
  });

  protected readonly totalPages = computed(() =>
    this.results.hasValue()
      ? Math.ceil(this.results.value().total / this.results.value().pageSize)
      : 0,
  );
  protected readonly pages = computed(() =>
    this.results.hasValue() ? pageWindow(this.results.value().page, this.totalPages()) : [],
  );

  protected trackProduct(
    type: 'product_impression' | 'product_click',
    productId: string,
    index: number,
  ): void {
    this.tracking.track({ type, productId, list: 'search', position: index + 1 });
  }
}
