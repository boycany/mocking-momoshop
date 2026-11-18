import { Category, HomeSection, Product } from '../../app/data-access/models';
import { CATEGORIES } from './categories';
import { buildHomeLayout } from './home-layout';
import { createRandom } from '../seed';
import { generateProducts } from './products';

export interface CatalogFixtures {
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
  readonly homeLayout: readonly HomeSection[];
  /** Products in a fixed pseudo-personalised order for the home feed. */
  readonly recommendations: readonly Product[];
}

const products = generateProducts();

/** Seeded Fisher-Yates shuffle, standing in for a recommendation ranking. */
function shuffled<T>(items: readonly T[], seed: number): T[] {
  const random = createRandom(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random.int(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Loaded lazily by MockCatalogApi through a dynamic import, so it ships as its own chunk. */
export const fixtures: CatalogFixtures = {
  categories: CATEGORIES,
  products,
  homeLayout: buildHomeLayout(products),
  recommendations: shuffled(products, 1118),
};
