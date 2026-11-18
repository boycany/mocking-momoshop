import { DOCUMENT, Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, defer, map, shareReplay, switchMap, throwError, timer } from 'rxjs';
import type { CatalogFixtures } from '../../mocks/fixtures';
import { CatalogApi } from './catalog.api';
import { CatalogNetworkError, ProductNotFoundError } from './catalog.errors';
import {
  Category,
  HomeSection,
  Product,
  RecommendationPage,
  RecommendationQuery,
  SearchQuery,
  SearchResult,
} from './models';
import { searchProducts } from './search-products';

export interface MockCatalogConfig {
  /** Inclusive latency range in milliseconds applied to every response. */
  readonly latencyMs: readonly [min: number, max: number];
  /** Evaluated per request; returning true makes the request fail with CatalogNetworkError. */
  readonly shouldFail: () => boolean;
}

export const MOCK_CATALOG_CONFIG = new InjectionToken<MockCatalogConfig>('MOCK_CATALOG_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return {
      latencyMs: [200, 400],
      // Append ?mockError=1 to any URL to exercise error states.
      shouldFail: () => new URLSearchParams(document.location?.search ?? '').has('mockError'),
    };
  },
});

/**
 * In-memory CatalogApi backed by generated fixtures. Simulates latency and failures so loading
 * and error states are real code paths. See ADR 0003.
 */
@Injectable()
export class MockCatalogApi extends CatalogApi {
  private readonly config = inject(MOCK_CATALOG_CONFIG);

  private readonly fixtures$: Observable<CatalogFixtures> = defer(
    () => import('../../mocks/fixtures'),
  ).pipe(
    map((module) => module.fixtures),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getHomeLayout(): Observable<readonly HomeSection[]> {
    return this.respond((fixtures) => fixtures.homeLayout);
  }

  getCategories(): Observable<readonly Category[]> {
    return this.respond((fixtures) => fixtures.categories);
  }

  getProduct(id: string): Observable<Product> {
    return this.respond((fixtures) => {
      const product = fixtures.products.find((candidate) => candidate.id === id);
      if (!product) {
        throw new ProductNotFoundError(id);
      }
      return product;
    });
  }

  getProductsByIds(ids: readonly string[]): Observable<readonly Product[]> {
    return this.respond((fixtures) => {
      const byId = new Map(fixtures.products.map((product) => [product.id, product]));
      return ids.flatMap((id) => byId.get(id) ?? []);
    });
  }

  searchProducts(query: SearchQuery): Observable<SearchResult> {
    return this.respond((fixtures) => searchProducts(fixtures.products, query));
  }

  getRecommendations({ offset, limit }: RecommendationQuery): Observable<RecommendationPage> {
    return this.respond((fixtures) => {
      const start = Math.max(0, Math.floor(offset));
      return {
        items: fixtures.recommendations.slice(start, start + Math.max(0, Math.floor(limit))),
        total: fixtures.recommendations.length,
      };
    });
  }

  private respond<T>(project: (fixtures: CatalogFixtures) => T): Observable<T> {
    return defer(() => {
      const [min, max] = this.config.latencyMs;
      const latency = min + Math.floor(Math.random() * (max - min + 1));

      return timer(latency).pipe(
        switchMap(() =>
          this.config.shouldFail()
            ? throwError(() => new CatalogNetworkError())
            : this.fixtures$.pipe(map(project)),
        ),
      );
    });
  }
}
