// src/app/features/products/models/product.model.ts
export interface ProductFormData {
  name: string;
  description: string;
  cost: number;
  salePrice: number;
  stock: number;
  brandId: number | string;
  categoryId: number | string;
}

export interface Product extends ProductFormData {
  id: string;
  // Outras propriedades que seu produto possa ter
}
