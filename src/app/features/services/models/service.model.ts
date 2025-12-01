// src/app/features/services/models/service.model.ts
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
}
