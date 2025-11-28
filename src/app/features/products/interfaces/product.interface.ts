export interface Product {
  id: number;
  name: string;
  description?: string;
  stock: number;
  cost: number;
  salePrice: number;
  brandId?: number;
  categoryId?: number;
  registrationDate: string;
  lastUpdate?: string;
  status: 'active' | 'inactive';
}

export interface ProductFormData {
  name: string;
  description?: string;
  stock: number;
  cost: number;
  salePrice: number;
  brandId?: number;
  categoryId?: number;
  status: 'active' | 'inactive';
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductBrand {
  id: number;
  name: string;
}
