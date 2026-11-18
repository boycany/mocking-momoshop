import { generateProducts } from '../../mocks/fixtures/products';
import { productProblems } from './validation';

describe('productProblems', () => {
  const valid = generateProducts()[0];

  it('accepts every generated fixture', () => {
    expect(generateProducts().flatMap(productProblems)).toEqual([]);
  });

  it('reports each kind of broken payload', () => {
    expect(productProblems(null)).toEqual(['not an object']);
    expect(productProblems({ ...valid, name: '' })).toEqual(['missing name']);
    expect(productProblems({ ...valid, price: 0 })).toContain('price must be a positive number');
    expect(productProblems({ ...valid, price: 500, originalPrice: 400 })).toEqual([
      'originalPrice must be null or greater than price',
    ]);
    expect(productProblems({ ...valid, images: [] })).toEqual(['missing images']);
  });
});
