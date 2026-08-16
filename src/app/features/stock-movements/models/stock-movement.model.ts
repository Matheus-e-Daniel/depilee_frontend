export enum EStockMovementType {
  Entry = 1,
  Exit = 2,
  Adjustment = 3,
  Transfer = 4,
  Other = 5
}

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: EStockMovementType;
  occurredAt: string;
  reason?: string;
}
