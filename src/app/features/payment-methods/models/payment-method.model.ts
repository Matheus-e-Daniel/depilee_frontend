// src/app/features/payment-methods/models/payment-method.model.ts
export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

export interface PaymentMethod {
  id?: string;
  name: string;
  type: string;
  allowInstallments: boolean;
  maxInstallments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodFormData {
  name: string;
  type: string;
  allowInstallments: boolean;
  maxInstallments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
}
