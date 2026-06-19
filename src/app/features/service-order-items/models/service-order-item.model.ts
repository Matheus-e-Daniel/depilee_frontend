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
  responsibleUserId?: number;
  quantity: number;
  unitPrice: number;
  registrationDate?: string;
  lastUpdate?: string;
  status: number;
  createdByUser?: string;
  updatedByUser?: string;
  productName?: string;
  serviceName?: string;
  serviceOrderNumber?: string;
  totalPrice?: number;
  commissionPercentageApplied?: number;
  commissionAmount?: number;
}

export interface ServiceOrderItemFormData {
  serviceOrderId: number;
  productId?: number;
  serviceId?: number;
  quantity: number;
  unitPrice?: number;
  responsibleUserId?: number;
}

export interface ServiceOrder {
  id: number;
  orderNumber: string;
}

export interface ProductOption {
  id: number;
  name: string;
  price: number;
}

export interface ServiceOption {
  id: number;
  name: string;
  price: number;
}
