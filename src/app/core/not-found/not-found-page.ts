import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="page-container not-found">
      <h1>找不到這個頁面</h1>
      <p>您要找的頁面可能已下架或網址有誤。</p>
      <a routerLink="/">回首頁</a>
    </section>
  `,
  styles: `
    .not-found {
      padding: 80px 0;
      text-align: center;
    }
    a {
      color: var(--momo-primary);
    }
  `,
})
export class NotFoundPage {}
