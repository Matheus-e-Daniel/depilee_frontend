export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
  Overdue = 3
}

export interface PaymentInstallment {
  id: number;
  paymentId: number;
  cashRegisterId: number;
  installmentNumber: number;
  value: number;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
}

export interface Payment {
  id: number;
  cashRegisterId: number;
  serviceOrderId: number;
  paymentMethodId: number;
  amount: number;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  notes: string | null;
  paymentInstallments: PaymentInstallment[];
}

export interface CreatePaymentData {
  cashRegisterId: number;
  serviceOrderId: number;
  paymentMethodId: number;
  amount: number;
  notes?: string | null;
}

export interface PayInstallmentData {
  paymentId: number;
  cashRegisterId: number;
  installmentId: number;
}
