export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  status: number;
  commissionPercentage?: number;
  registrationDate: string;
  lastUpdate: string | null;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  commissionPercentage?: number | null;
}
