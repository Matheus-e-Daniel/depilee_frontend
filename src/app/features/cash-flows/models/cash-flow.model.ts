export enum ECashFlowType {
  In = 1,
  Out = 2
}

export interface CashFlow {
  id: number;
  cashRegisterId: number;
  type: ECashFlowType;
  description?: string;
  value: number;
  paymentId?: number;
  paymentInstallmentId?: number;
  serviceOrderId?: number;
  registrationDate: string;
  lastUpdate?: string | null;
  status: number;
  createdByUser?: string;
  updatedByUser?: string;
}

export interface CashFlowFormData {
  cashRegisterId: number;
  type: ECashFlowType;
  description?: string;
  value: number;
}
