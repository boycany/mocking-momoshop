import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CatalogApi } from '../../data-access/catalog.api';
import { LoadError } from '../../shared/ui/load-error/load-error';
import { HomeSectionHost } from './home-section-host';

/** Sections above the fold render immediately; the rest wait until they scroll into view. */
const EAGER_SECTION_COUNT = 2;

@Component({
  selector: 'app-home-page',
  imports: [HomeSectionHost, LoadError],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly catalog = inject(CatalogApi);

  protected readonly eagerCount = EAGER_SECTION_COUNT;
  protected readonly layout = rxResource({ stream: () => this.catalog.getHomeLayout() });
}
