import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { CatalogApi } from './data-access/catalog.api';

describe('App', () => {
  it('renders the layout shell around the router outlet', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: CatalogApi, useValue: { getCategories: () => of([]) } },
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    for (const selector of [
      'app-utility-bar',
      'app-header',
      'app-category-nav',
      'router-outlet',
      'app-footer',
      'app-floating-sidebar',
    ]) {
      expect(element.querySelector(selector)).not.toBeNull();
    }
  });
});
