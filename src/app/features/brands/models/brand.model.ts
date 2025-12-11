// src/app/features/brands/models/brand.model.ts
export interface BrandFormData {
  name: string;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}

export interface Brand extends BrandFormData {
  id: string;
}
