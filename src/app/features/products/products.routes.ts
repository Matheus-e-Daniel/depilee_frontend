import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list-products/list-products.component').then(
        (m) => m.ListProductsComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
];
