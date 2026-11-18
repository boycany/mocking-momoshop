import { discountLabel } from './price.utils';

describe('discountLabel', () => {
  it('formats discounts in Taiwanese notation', () => {
    expect(discountLabel(800, 1000)).toBe('8折');
    expect(discountLabel(339, 599)).toBe('5.7折');
  });

  it('returns null without a real discount', () => {
    expect(discountLabel(500, null)).toBeNull();
    expect(discountLabel(500, 500)).toBeNull();
    expect(discountLabel(600, 500)).toBeNull();
  });
});
