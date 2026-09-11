export interface ServiceOrder {
  id: number;
  orderNumber: string;
  clientId: number;
  sellerUserId?: number | null;
  discount: number;
  creditApplied?: number;
  total: number;
  orderStatus: OrderStatus;
  cashRegisterId: number;
  notes?: string;
  registrationDate?: string;
  lastUpdate?: string;
  completedAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  createdByUser?: string;
  updatedByUser?: string;
  clientName?: string;
  cashRegisterName?: string;
}

export interface ServiceOrderFormData {
  orderNumber: string;
  clientId: number | null;
  sellerUserId?: number | null;
  discount: number | null;
  total: number;
  orderStatus: OrderStatus;
  cashRegisterId: number | null;
  notes?: string | null;
}

export enum OrderStatus {
  Draft = 0,
  Open = 1,
  Paid = 3,
  Completed = 4,
  Cancelled = 5
}

export interface ClientOption {
  id: number;
  name: string;
}

export interface CashRegisterOption {
  id: number;
  name: string;
}
