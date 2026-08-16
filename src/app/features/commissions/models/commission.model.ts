export interface CommissionSettings {
  globalCommissionPercentage?: number | null;
}

export interface CommissionApplyRequest {
  userId: number;
  serviceOrderItemIds: number[];
}

export interface CommissionServiceItem {
  serviceOrderId: number;
  serviceOrderNumber: string;
  serviceOrderItemId: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionPercentageApplied: number;
  commissionAmount: number;
  completedAt: string;
}

export interface CommissionResult {
  userId: number;
  userName: string;
  startDate: string | null;
  endDate: string | null;
  totalServicesAmount: number;
  totalCommissionAmount: number;
  services: CommissionServiceItem[];
}
