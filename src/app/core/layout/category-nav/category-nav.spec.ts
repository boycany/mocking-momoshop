import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CatalogApi } from '../../../data-access/catalog.api';
import { CategoryNav } from './category-nav';

describe('CategoryNav', () => {
  it('renders the home tab followed by categories from CatalogApi', async () => {
    TestBed.configureTestingModule({
      imports: [CategoryNav],
      providers: [
        provideRouter([]),
        {
          provide: CatalogApi,
          useValue: {
            getCategories: () =>
              of([
                { id: 'appliance', name: '家電' },
                { id: 'beauty', name: '美妝保養' },
              ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(CategoryNav);
    await fixture.whenStable();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual(['首頁', '家電', '美妝保養']);
    expect(links[1].getAttribute('href')).toBe('/search?categoryId=appliance');
  });
});
