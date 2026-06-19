export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  active: boolean;
  commissionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  active: boolean;
  commissionPercentage?: number | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
}
