import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { CartStore, MAX_ITEM_QUANTITY } from '../../data-access/stores/cart.store';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, DecimalPipe, KeyValuePipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly cart = inject(CartStore);
  protected readonly quantityOptions = Array.from(
    { length: Math.min(MAX_ITEM_QUANTITY, 20) },
    (_, i) => i + 1,
  );

  protected onQuantityChange(key: string, event: Event): void {
    this.cart.updateQuantity(key, Number((event.target as HTMLSelectElement).value));
  }

  protected checkout(): void {
    this.snackBar.open('結帳流程不在本次實作範圍內', undefined, { duration: 2500 });
  }
}
