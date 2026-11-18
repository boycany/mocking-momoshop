import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
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

  it('emits opened on click', () => {
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    const opened = vi.fn();
    fixture.componentInstance.opened.subscribe(opened);
    // The test has no routes; stub navigation so the click does not fail after teardown.
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector('a')?.click();
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('emits impression only the first time it becomes visible', async () => {
    let report: (visible: boolean) => void = () => undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
          report = (visible) => callback([{ isIntersecting: visible }]);
        }
        observe(): void {
          // Driven manually through report().
        }
        disconnect(): void {
          // Nothing to clean up.
        }
      },
    );
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    const impression = vi.fn();
    fixture.componentInstance.impression.subscribe(impression);
    await fixture.whenStable();

    report(true);
    report(false);
    report(true);
    expect(impression).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
