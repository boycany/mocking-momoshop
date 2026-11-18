import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="page-container">
        <p>Mocking momoshop：前端面試作品，非 momo 購物網官方網站。所有商品與活動皆為模擬資料。</p>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      margin-top: 48px;
      padding: 24px 0;
      background: #333;
      color: #ccc;
      font-size: 13px;
    }
  `,
})
export class Footer {}
