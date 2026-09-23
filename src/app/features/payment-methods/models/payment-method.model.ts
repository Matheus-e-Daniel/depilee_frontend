export interface PaymentMethod {
  id: number;
  name: string;
  type: number;
  installments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
  registrationDate?: string;
  status: number;
}

export interface PaymentMethodFormData {
  name: string;
  type: number;
  installments: number;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
}

export interface PaymentMethodUpdateData {
  id: number;
  name: string;
  type: number;
  allowInstallments: boolean;
  maxInstallments: number | null;
  interestRatePerInstallment: number;
  feePercentage: number;
  description: string;
}
