import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Product } from '../../../data-access/models';
import { ProductCard } from './product-card';

const product: Product = {
  id: 'beauty-001',
  name: '【寶拉珍選】2%水楊酸精華液',
  brand: '寶拉珍選',
  promoText: '滿1000折200',
  categoryId: 'beauty',
  price: 1320,
  originalPrice: 1980,
  images: ['data:image/svg+xml,'],
  tags: [
    { type: 'fast-delivery', label: '快速到貨' },
    { type: 'coupon', label: '折價券' },
  ],
  specs: [],
  rating: 4.5,
  reviewCount: 636,
  soldCount: 200_000,
  description: '',
  createdAt: '2026-11-01',
};

describe('ProductCard', () => {
  function render(overrides: Partial<Product> = {}) {
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...product, ...overrides });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links to the goods page and shows the card details', () => {
    const element = render();
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/goods/beauty-001');
    expect(element.querySelector('.promo')?.textContent).toBe('滿1000折200');
    expect(element.querySelector('.name')?.textContent).toBe('【寶拉珍選】2%水楊酸精華液');
    expect(element.querySelector('.sold')?.textContent).toBe('總銷量>20萬');
  });

  it('shows fast delivery as a badge instead of a tag', () => {
    const element = render();
    expect(element.querySelector('.fast')).not.toBeNull();
    const tags = Array.from(element.querySelectorAll('.tags li')).map((li) => li.textContent);
    expect(tags).toEqual(['折價券']);
  });

  it('omits the badge and tag row when there are no tags', () => {
    const element = render({ tags: [] });
    expect(element.querySelector('.fast')).toBeNull();
    expect(element.querySelector('.tags')).toBeNull();
  });
});
