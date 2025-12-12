// src/app/features/service-orders/models/service-order.model.ts
export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

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
  // Campos de relacionamento
  clientName?: string;
  cashRegisterName?: string;
}

export interface ServiceOrderFormData {
  orderNumber: string;
  clientId: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  cashRegisterId: number;
  notes?: string;
}

export enum OrderStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export interface Client {
  id: number;
  name: string;
}

export interface CashRegister {
  id: number;
  name: string;
}
