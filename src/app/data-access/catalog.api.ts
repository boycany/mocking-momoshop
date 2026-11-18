import { Observable } from 'rxjs';
import {
  Category,
  HomeSection,
  Product,
  RecommendationPage,
  RecommendationQuery,
  SearchQuery,
  SearchResult,
} from './models';

/**
 * Data boundary for every page. Features depend on this abstraction only; the implementation
 * is chosen by a provider in app.config.ts (mock today, HTTP later). See ADR 0003 and ADR 0007.
 *
 * All methods are cold Observables: nothing happens until subscribed, and unsubscribing cancels.
 */
export abstract class CatalogApi {
  abstract getHomeLayout(): Observable<readonly HomeSection[]>;

  abstract getCategories(): Observable<readonly Category[]>;

  /** Errors with ProductNotFoundError when the id does not exist. */
  abstract getProduct(id: string): Observable<Product>;

  /** Returns products in the order of `ids`, silently skipping unknown ids. */
  abstract getProductsByIds(ids: readonly string[]): Observable<readonly Product[]>;

  abstract searchProducts(query: SearchQuery): Observable<SearchResult>;

  /** Personalised feed, paged by offset. `total` lets callers know when the feed is exhausted. */
  abstract getRecommendations(query: RecommendationQuery): Observable<RecommendationPage>;
}
