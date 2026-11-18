import { DOCUMENT, Injectable, InjectionToken, inject } from '@angular/core';
import { LOG_SINK } from '../shared/observability/log-sink';
import { Observable, defer, map, shareReplay, switchMap, tap, throwError, timer } from 'rxjs';
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
import { productProblems } from './validation';

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

/** Loads the raw fixtures. Lazy by default so they ship as their own chunk; tests can inject their own. */
export const MOCK_FIXTURES_LOADER = new InjectionToken<() => Promise<CatalogFixtures>>(
  'MOCK_FIXTURES_LOADER',
  {
    providedIn: 'root',
    factory: () => () => import('../../mocks/fixtures').then((module) => module.fixtures),
  },
);

/**
 * In-memory CatalogApi backed by generated fixtures. Simulates latency and failures so loading
 * and error states are real code paths. See ADR 0003.
 */
@Injectable()
export class MockCatalogApi extends CatalogApi {
  private readonly config = inject(MOCK_CATALOG_CONFIG);

  private readonly sink = inject(LOG_SINK);
  private readonly loadFixtures = inject(MOCK_FIXTURES_LOADER);

  private readonly fixtures$: Observable<CatalogFixtures> = defer(() => this.loadFixtures()).pipe(
    map((fixtures) => this.dropInvalidProducts(fixtures)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getHomeLayout(): Observable<readonly HomeSection[]> {
    return this.respond('getHomeLayout', (fixtures) => fixtures.homeLayout);
  }

  getCategories(): Observable<readonly Category[]> {
    return this.respond('getCategories', (fixtures) => fixtures.categories);
  }

  getProduct(id: string): Observable<Product> {
    return this.respond('getProduct', (fixtures) => {
      const product = fixtures.products.find((candidate) => candidate.id === id);
      if (!product) {
        throw new ProductNotFoundError(id);
      }
      return product;
    });
  }

  getProductsByIds(ids: readonly string[]): Observable<readonly Product[]> {
    return this.respond('getProductsByIds', (fixtures) => {
      const byId = new Map(fixtures.products.map((product) => [product.id, product]));
      return ids.flatMap((id) => byId.get(id) ?? []);
    });
  }

  searchProducts(query: SearchQuery): Observable<SearchResult> {
    return this.respond('searchProducts', (fixtures) => searchProducts(fixtures.products, query));
  }

  getRecommendations({ offset, limit }: RecommendationQuery): Observable<RecommendationPage> {
    return this.respond('getRecommendations', (fixtures) => {
      const start = Math.max(0, Math.floor(offset));
      return {
        items: fixtures.recommendations.slice(start, start + Math.max(0, Math.floor(limit))),
        total: fixtures.recommendations.length,
      };
    });
  }

  /**
   * One malformed record must not take the whole page down: invalid products are removed from
   * every list and reported, and product rails simply skip ids that no longer resolve. See ADR 0008.
   */
  private dropInvalidProducts(fixtures: CatalogFixtures): CatalogFixtures {
    const invalidIds = new Set<unknown>();
    for (const product of fixtures.products) {
      const problems = productProblems(product);
      if (problems.length) {
        invalidIds.add((product as { id?: unknown }).id);
        this.sink({
          level: 'warn',
          name: 'InvalidCatalogRecord',
          message: `Dropped product ${String((product as { id?: unknown }).id)}`,
          url: '',
          timestamp: new Date().toISOString(),
          context: { problems },
        });
      }
    }
    if (!invalidIds.size) {
      return fixtures;
    }
    const isValid = (product: { id: unknown }) => !invalidIds.has(product.id);
    return {
      ...fixtures,
      products: fixtures.products.filter(isValid),
      recommendations: fixtures.recommendations.filter(isValid),
    };
  }

  private respond<T>(operation: string, project: (fixtures: CatalogFixtures) => T): Observable<T> {
    return defer(() => {
      const [min, max] = this.config.latencyMs;
      const latency = min + Math.floor(Math.random() * (max - min + 1));

      return timer(latency).pipe(
        switchMap(() =>
          this.config.shouldFail()
            ? throwError(() => new CatalogNetworkError())
            : this.fixtures$.pipe(map(project)),
        ),
        tap({ error: (error: unknown) => this.reportFailure(operation, error) }),
      );
    });
  }

  /**
   * Failed requests are handled by the UI (error state + retry), so they never reach the global
   * ErrorHandler. Report them here so operations still see them. "Not found" is an expected
   * business outcome (e.g. an old link), not a fault, and is skipped to keep the signal clean.
   */
  private reportFailure(operation: string, error: unknown): void {
    if (error instanceof ProductNotFoundError) {
      return;
    }
    this.sink({
      level: 'warn',
      name: 'CatalogRequestFailed',
      message: `${operation} failed`,
      url: '',
      timestamp: new Date().toISOString(),
      context: { operation, error: error instanceof Error ? error.name : String(error) },
    });
  }
}
