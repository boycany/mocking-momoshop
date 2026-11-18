import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-load-error',
  template: `
    <div class="load-error" role="alert">
      <span>{{ message() }}</span>
      <button type="button" (click)="retry.emit()">重試</button>
    </div>
  `,
  styles: `
    .load-error {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      color: var(--momo-muted);
    }
    button {
      padding: 4px 16px;
      border: 1px solid var(--momo-primary);
      border-radius: 16px;
      background: #fff;
      color: var(--momo-primary);
      cursor: pointer;
    }
  `,
})
export class LoadError {
  readonly message = input('載入失敗，請稍後再試');
  readonly retry = output();
}
