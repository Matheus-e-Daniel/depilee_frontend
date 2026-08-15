export interface ServiceOrder {
  id: number;
  orderNumber: string;
  clientId: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  cashRegisterId: number;
  notes?: string;
  registrationDate?: string;
  lastUpdate?: string;
  status?: number;
  createdByUser?: string;
  updatedByUser?: string;
  clientName?: string;
  cashRegisterName?: string;
}

export interface ServiceOrderFormData {
  orderNumber: string;
  clientId: number | null;
  discount: number | null;
  total: number;
  orderStatus: OrderStatus;
  cashRegisterId: number | null;
  notes?: string | null;
}

export enum OrderStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export interface ClientOption {
  id: number;
  name: string;
}

export interface CashRegisterOption {
  id: number;
  name: string;
}
