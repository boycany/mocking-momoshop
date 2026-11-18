import { CATEGORIES } from './categories';
import { buildHomeLayout } from './home-layout';
import { PRODUCTS_PER_CATEGORY, generateProducts } from './products';

describe('catalog fixtures', () => {
  const products = generateProducts();

  it('are deterministic for the same seed', () => {
    expect(generateProducts()).toEqual(products);
    expect(generateProducts(1)).not.toEqual(products);
  });

  it('generate a fixed number of products per category with unique ids', () => {
    expect(products).toHaveLength(CATEGORIES.length * PRODUCTS_PER_CATEGORY);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
  });

  it('only reference known categories and keep prices consistent', () => {
    const categoryIds = new Set(CATEGORIES.map((category) => category.id));
    for (const product of products) {
      expect(categoryIds.has(product.categoryId)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
      if (product.originalPrice !== null) {
        expect(product.originalPrice).toBeGreaterThan(product.price);
      }
    }
  });

  it('build a home layout whose product rails reference existing, non-empty products', () => {
    const productIds = new Set(products.map((product) => product.id));
    const rails = buildHomeLayout(products).filter((section) => section.type === 'product-rail');

    expect(rails.length).toBeGreaterThan(0);
    for (const rail of rails) {
      expect(rail.productIds.length).toBeGreaterThan(0);
      expect(rail.productIds.every((id) => productIds.has(id))).toBe(true);
    }
  });
});
