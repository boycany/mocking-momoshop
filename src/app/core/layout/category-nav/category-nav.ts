import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogApi } from '../../../data-access/catalog.api';
import { injectQueryParam } from '../../routing/query-param';

@Component({
  selector: 'app-category-nav',
  imports: [RouterLink],
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.scss',
})
export class CategoryNav {
  private readonly catalog = inject(CatalogApi);

  protected readonly categories = rxResource({ stream: () => this.catalog.getCategories() });
  protected readonly activeCategoryId = injectQueryParam('categoryId');
}
