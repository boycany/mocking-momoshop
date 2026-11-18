import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { CatalogApi } from '../../../data-access/catalog.api';
import {
  Product,
  ProductFeedSection,
  RecommendationPage,
  RecommendationQuery,
} from '../../../data-access/models';
import { ProductFeed } from './product-feed';

/** jsdom has no IntersectionObserver; this fake lets tests decide when the sentinel is visible. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  private element?: Element;

  /** Every product card has its own observer now, so tests look the sentinel up by element. */
  static get sentinel(): FakeIntersectionObserver {
    const observer = FakeIntersectionObserver.instances.find((instance) =>
      instance.element?.classList.contains('sentinel'),
    );
    if (!observer) {
      throw new Error('sentinel observer not found');
    }
    return observer;
  }

  constructor(private readonly callback: (entries: { isIntersecting: boolean }[]) => void) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(element: Element): void {
    this.element = element;
  }
  disconnect(): void {
    // Nothing to clean up.
  }
  setVisible(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }]);
  }
}

const TOTAL = 60;
const catalogProducts = Array.from(
  { length: TOTAL },
  (_, index) =>
    ({
      id: `p${index}`,
      name: `商品 ${index}`,
      brand: 'Brand',
      promoText: null,
      categoryId: 'appliance',
      price: 100,
      originalPrice: null,
      images: [''],
      tags: [],
      specs: [],
      rating: 5,
      reviewCount: 0,
      soldCount: 0,
      description: '',
      createdAt: '2026-11-01',
    }) satisfies Product,
);

const section: ProductFeedSection = {
  type: 'product-feed',
  id: 'feed',
  title: '為你推薦',
  pageSize: 10,
  autoLoadPerRound: 2,
};

describe('ProductFeed', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  async function setup(respond?: (query: RecommendationQuery) => Observable<RecommendationPage>) {
    const getRecommendations = vi.fn(
      respond ??
        ((query: RecommendationQuery) =>
          of({
            items: catalogProducts.slice(query.offset, query.offset + query.limit),
            total: TOTAL,
          })),
    );
    TestBed.configureTestingModule({
      imports: [ProductFeed],
      providers: [provideRouter([]), { provide: CatalogApi, useValue: { getRecommendations } }],
    });
    const fixture = TestBed.createComponent(ProductFeed);
    fixture.componentRef.setInput('section', section);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const cardCount = () => element.querySelectorAll('app-product-card').length;
    const button = () => element.querySelector<HTMLButtonElement>('.more button');
    const scrollToBottom = async () => {
      FakeIntersectionObserver.sentinel.setVisible(true);
      await fixture.whenStable();
    };
    return { fixture, getRecommendations, cardCount, button, scrollToBottom };
  }

  it('loads the first batch without scrolling and shows no button yet', async () => {
    const { cardCount, button } = await setup();
    expect(cardCount()).toBe(10);
    expect(button()).toBeNull();
  });

  it('auto-loads two batches on scroll, then waits for "看更多"', async () => {
    const { cardCount, button, scrollToBottom, getRecommendations } = await setup();
    await scrollToBottom();

    expect(cardCount()).toBe(30);
    expect(getRecommendations).toHaveBeenCalledTimes(3);
    expect(button()?.textContent?.trim()).toBe('看更多');
    expect(button()?.disabled).toBe(false);
  });

  it('starts a new round on click: one batch plus two auto-loads', async () => {
    const { fixture, cardCount, button, scrollToBottom } = await setup();
    await scrollToBottom();
    button()?.click();
    await fixture.whenStable();

    expect(cardCount()).toBe(60);
  });

  it('disables the button once every product is loaded and stops requesting', async () => {
    const { fixture, button, scrollToBottom, getRecommendations } = await setup();
    await scrollToBottom();
    button()?.click();
    await fixture.whenStable();

    expect(button()?.textContent?.trim()).toBe('已經沒有新商品了');
    expect(button()?.disabled).toBe(true);
    expect(getRecommendations).toHaveBeenCalledTimes(6);

    FakeIntersectionObserver.sentinel.setVisible(false);
    await scrollToBottom();
    expect(getRecommendations).toHaveBeenCalledTimes(6);
  });

  it('never runs two requests at once while a batch is in flight', async () => {
    const pending = new Subject<RecommendationPage>();
    const { fixture, getRecommendations } = await setup(() => pending);
    expect(getRecommendations).toHaveBeenCalledTimes(1);

    FakeIntersectionObserver.sentinel.setVisible(true);
    FakeIntersectionObserver.sentinel.setVisible(false);
    FakeIntersectionObserver.sentinel.setVisible(true);
    fixture.detectChanges();

    expect(getRecommendations).toHaveBeenCalledTimes(1);
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-product-card-skeleton').length,
    ).toBe(5);
  });
});
