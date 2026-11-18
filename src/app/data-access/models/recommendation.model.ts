import { Product } from './product.model';

/** Offset-based paging suits an append-only feed (unlike user-facing page numbers in search). */
export interface RecommendationQuery {
  readonly offset: number;
  readonly limit: number;
}

export interface RecommendationPage {
  readonly items: readonly Product[];
  readonly total: number;
}
