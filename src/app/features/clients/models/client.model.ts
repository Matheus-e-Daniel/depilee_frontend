// src/app/features/clients/models/client.model.ts
export interface Client {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'O'; // M: Masculino, F: Feminino, O: Outro
  cpf: string;
  phone: string;
  email: string;
  birth: string; // ISO date string
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  gender: 'M' | 'F' | 'O';
  cpf: string;
  phone: string;
  email: string;
  birth: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  active: boolean;
}
