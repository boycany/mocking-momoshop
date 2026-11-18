import { Component, input } from '@angular/core';

@Component({
  selector: 'app-goods-page',
  template: `<section class="page-container placeholder">商品頁建置中：{{ id() }}</section>`,
  styles: `
    .placeholder {
      padding: 48px 0;
      color: var(--momo-muted);
    }
  `,
})
export class GoodsPage {
  /** Bound from the `:id` route param via withComponentInputBinding(). */
  readonly id = input.required<string>();
}
