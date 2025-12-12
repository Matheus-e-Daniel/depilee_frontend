// src/app/features/service-order-items/models/service-order-item.model.ts
export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

export interface ServiceOrderItem {
  id: number;
  serviceOrderId: number;
  productId?: number;
  serviceId?: number;
  quantity: number;
  unitPrice: number;
  registrationDate?: string;
  lastUpdate?: string;
  status: number;
  createdByUser?: string;
  updatedByUser?: string;
  // Campos de relacionamento
  productName?: string;
  serviceName?: string;
  serviceOrderNumber?: string;
  totalPrice?: number;
}

export interface ServiceOrderItemFormData {
  serviceOrderId: number;
  productId?: number;
  serviceId?: number;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: number;
  orderNumber: string;
}

export interface ProductOption {
  id: number;
  name: string;
  salePrice: number;
}

export interface ServiceOption {
  id: number;
  name: string;
  price: number;
}
