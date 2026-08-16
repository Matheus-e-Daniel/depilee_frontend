export interface ProductFormData {
  name: string;
  description: string;
  cost: number;
  salePrice: number;
  stock: number;
  brandId: number | string;
  categoryId: number | string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  brandId: number;
  categoryId: number;
  registrationDate: string;
  lastUpdate: string | null;
  status: number;
  createdByUser: string;
  updatedByUser: string;
}
