export interface ProductFormData {
  name: string;
  description: string;
  cost: number;
  salePrice: number;
  stock: number;
  brandId: number | string;
  categoryId: number | string;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}


export interface Product {
  id: string;
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
