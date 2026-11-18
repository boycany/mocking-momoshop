import { Category, HomeSection, Product } from '../../app/data-access/models';
import { CATEGORIES } from './categories';
import { buildHomeLayout } from './home-layout';
import { generateProducts } from './products';

export interface CatalogFixtures {
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
  readonly homeLayout: readonly HomeSection[];
}

const products = generateProducts();

/** Loaded lazily by MockCatalogApi through a dynamic import, so it ships as its own chunk. */
export const fixtures: CatalogFixtures = {
  categories: CATEGORIES,
  products,
  homeLayout: buildHomeLayout(products),
};
