import { Component, inject, linkedSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { injectQueryParam } from '../../routing/query-param';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);

  /** Keeps the box in sync with the URL keyword, while still letting the user type freely. */
  protected readonly keyword = linkedSignal(injectQueryParam('keyword'));

  protected readonly hotKeywords = ['國際牌 洗衣機', 'panasonic掛燙機', '北歐風矮櫃'];

  protected readonly promos = [
    { title: '今日秒殺', caption: '鮮筍海帶湯', footer: 'mo店+' },
    { title: '全站加碼送', caption: '$900', footer: '加碼送mo點' },
    { title: '訂閱直送', caption: '領1080', footer: '會員專屬' },
  ];

  protected onInput(event: Event): void {
    this.keyword.set((event.target as HTMLInputElement).value);
  }

  protected search(keyword = this.keyword()): void {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return;
    }
    this.keyword.set(trimmed);
    void this.router.navigate(['/search'], { queryParams: { keyword: trimmed } });
  }
}
