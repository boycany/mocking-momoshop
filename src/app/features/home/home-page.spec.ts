import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CatalogApi } from '../../data-access/catalog.api';
import { HomeSection } from '../../data-access/models';
import { HomePage } from './home-page';

const link = { commands: ['/search'] };
const layout: HomeSection[] = [
  { type: 'hero-carousel', id: 'hero', banners: [], todayBrand: { title: '今日大牌', tiles: [] } },
  { type: 'quick-entry', id: 'quick', items: [] },
  { type: 'promo-banner', id: 'promo', title: '今日限定', subtitle: '', image: '', link },
  { type: 'product-rail', id: 'rail', title: '熱銷排行', productIds: [] },
];

describe('HomePage', () => {
  function setup(catalog: Partial<CatalogApi>) {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: CatalogApi, useValue: catalog }],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    return TestBed.createComponent(HomePage);
  }

  it('renders above-the-fold sections eagerly and defers the rest', async () => {
    const fixture = setup({ getHomeLayout: () => of(layout), getProductsByIds: () => of([]) });
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('app-hero-carousel')).not.toBeNull();
    expect(element.querySelector('app-quick-entry')).not.toBeNull();
    expect(element.querySelector('app-promo-banner')).toBeNull();

    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    expect(element.querySelector('app-promo-banner')).not.toBeNull();
    expect(element.querySelector('app-product-rail')).not.toBeNull();
  });

  it('shows a retryable error when the layout fails to load', async () => {
    const fixture = setup({ getHomeLayout: () => throwError(() => new Error('boom')) });
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-load-error')).not.toBeNull();
  });
});
