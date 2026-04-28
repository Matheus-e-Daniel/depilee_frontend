export interface CategoryFormData {
  name: string;
  description: string;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}

export interface Category extends CategoryFormData {
  id: string;
}
