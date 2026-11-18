import { soldCountLabel } from './product-card.utils';

describe('soldCountLabel', () => {
  it('rounds down like the real site', () => {
    expect(soldCountLabel(50_000)).toBe('總銷量>5萬');
    expect(soldCountLabel(15_400)).toBe('總銷量>1.5萬');
    expect(soldCountLabel(8_999)).toBe('總銷量>8,000');
    expect(soldCountLabel(456)).toBe('總銷量>400');
    expect(soldCountLabel(12)).toBe('總銷量 12');
  });
});
