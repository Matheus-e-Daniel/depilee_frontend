// src/app/features/service-order-items/models/service-order-item.model.ts
export interface ServiceOrderItem {
  id: string;
  serviceOrderId: string;
  productId?: string;
  serviceId?: string;
  productName?: string;
  serviceName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderItemFormData {
  serviceOrderId: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  price: number;
}
