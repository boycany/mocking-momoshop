import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-utility-bar',
  imports: [RouterLink],
  templateUrl: './utility-bar.html',
  styleUrl: './utility-bar.scss',
})
export class UtilityBar {
  /** Static links that are out of scope for this mock (see docs/plan.md). */
  protected readonly leftLinks = ['momo富立保險', 'APP下載', '點點賺分潤計劃', '書店'];
  protected readonly rightLinks = ['登入', '註冊', '會員中心', '查訂單', '追蹤清單', '折價券'];
}
