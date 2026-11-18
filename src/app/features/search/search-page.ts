import { Component, input } from '@angular/core';

@Component({
  selector: 'app-search-page',
  template: `<section class="page-container placeholder">
    搜尋結果建置中：{{ keyword() || categoryId() || '全部商品' }}
  </section>`,
  styles: `
    .placeholder {
      padding: 48px 0;
      color: var(--momo-muted);
    }
  `,
})
export class SearchPage {
  /** Bound from query params; the URL is the single source of truth (ADR 0002). */
  readonly keyword = input<string>();
  readonly categoryId = input<string>();
}
