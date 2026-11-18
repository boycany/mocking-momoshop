import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'momo購物網',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'goods/:id',
    title: '商品資訊 | momo購物網',
    loadComponent: () => import('./features/goods/goods-page').then((m) => m.GoodsPage),
  },
  {
    path: 'search',
    title: '搜尋結果 | momo購物網',
    loadComponent: () => import('./features/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'cart',
    title: '購物車 | momo購物網',
    loadComponent: () => import('./features/cart/cart-page').then((m) => m.CartPage),
  },
  {
    path: '**',
    title: '找不到頁面 | momo購物網',
    loadComponent: () => import('./core/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
