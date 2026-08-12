export interface PaymentMethod {
  id: string;
  name: string;
  type: number;
  installments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodFormData {
  name: string;
  type: number;
  installments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
}
