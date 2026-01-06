export interface CashRegisterFormData {
  initialBalance: number;
  notes?: string;
}

export interface PagedResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  data: T[];
  message: string | null;
}

export interface CashRegister extends CashRegisterFormData {
  CashRegisterStatus: number;
  id: string;
}
