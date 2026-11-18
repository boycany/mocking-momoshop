import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CatalogApi } from '../../data-access/catalog.api';
import { Product, SearchQuery, SearchResult } from '../../data-access/models';
import { SearchPage } from './search-page';

const product = (id: string): Product => ({
  id,
  name: `商品 ${id}`,
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
});

describe('SearchPage', () => {
  async function render(inputs: Record<string, string>, result: Partial<SearchResult> = {}) {
    const searchProducts = vi.fn((query: SearchQuery) =>
      of<SearchResult>({
        items: [product('a')],
        total: 45,
        page: query.page,
        pageSize: 20,
        ...result,
      }),
    );
    TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        provideRouter([]),
        {
          provide: CatalogApi,
          useValue: {
            searchProducts,
            getCategories: () => of([{ id: 'appliance', name: '家電' }]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SearchPage);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const hrefs = (selector: string) =>
      Array.from(element.querySelectorAll(selector)).map((link) => link.getAttribute('href'));
    return { element, searchProducts, hrefs };
  }

  it('turns URL params into a search query, repairing invalid values', async () => {
    const { searchProducts } = await render({ keyword: ' 洗衣機 ', sort: 'bogus', page: '-3' });
    expect(searchProducts).toHaveBeenCalledWith({
      keyword: '洗衣機',
      categoryId: undefined,
      sort: 'relevance',
      page: 1,
      pageSize: 20,
    });
  });

  it('shows the keyword heading and result count', async () => {
    const { element } = await render({ keyword: '洗衣機' });
    expect(element.querySelector('h1')?.textContent).toBe('「洗衣機」搜尋結果');
    expect(element.querySelector('.count')?.textContent).toBe('共 45 筆');
  });

  it('names the category when browsing without a keyword', async () => {
    const { element } = await render({ categoryId: 'appliance' });
    expect(element.querySelector('h1')?.textContent).toBe('家電');
  });

  it('links sort options and resets the page', async () => {
    const { hrefs, element } = await render({ keyword: 'x', sort: 'price-asc', page: '2' });
    expect(hrefs('.sort a')).toEqual([
      '/search',
      '/search?sort=price-asc',
      '/search?sort=price-desc',
      '/search?sort=newest',
    ]);
    expect(element.querySelector('.sort a.active')?.textContent?.trim()).toBe('價格低到高');
  });

  it('renders page links around the current page', async () => {
    const { hrefs, element } = await render({ keyword: 'x', page: '2' });
    expect(element.querySelector('.pagination .current')?.textContent).toBe('2');
    expect(hrefs('.pagination a')).toEqual([
      '/search?page=1',
      '/search?page=1',
      '/search?page=3',
      '/search?page=3',
    ]);
  });

  it('suggests other keywords when nothing matches', async () => {
    const { element } = await render({ keyword: 'zzz' }, { items: [], total: 0 });
    expect(element.textContent).toContain('查無相關商品');
    expect(element.querySelector('.grid')).toBeNull();
  });
});
