export interface CatalogItemInfo {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  status: number;
}

export interface ServiceOrderItem {
  id: number;
  serviceOrderId: number;
  itemId: number;
  item: CatalogItemInfo;
  quantity: number;
  unitPrice: number;
  registrationDate?: string;
  createdByUser?: string;
  responsibleUserId?: number;
  commissionPercentageApplied?: number;
  commissionAmount?: number;
  commissionRecalculatedAt?: string | null;
}

export interface ServiceOrderItemFormData {
  serviceOrderId: number;
  catalogItemId: number;
  quantity: number;
  responsibleUserId?: number;
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
