// src/app/features/clients/models/client.model.ts
export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

export interface Client {
  id: string;
  name: string;
  gender: number; // 1: Masculino, 2: Feminino, 3: Outro
  cpf: string;
  phone: string;
  email: string;
  birth: string; // ISO date string
  address: {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  gender: number; // 1: Masculino, 2: Feminino, 3: Outro
  cpf: string;
  phone: string;
  email: string;
  birth: string; // ISO format: "1990-05-15T00:00:00"
  address: {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
  };
}
