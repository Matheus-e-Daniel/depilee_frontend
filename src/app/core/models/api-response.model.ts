export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PagedApiResponse<T> extends ApiResponse<T[]> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
