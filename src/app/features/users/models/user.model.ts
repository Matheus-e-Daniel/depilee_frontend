export interface Address {
  cep: string;
  state: string;
  city: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  password: string;
  cpf: string;
  birth: string;
  gender: number;
  roles?: string[];
  address: Address;
  commissionPercentage?: number | null;
  isDeleted: boolean;
}

export interface UserFormData {
  email: string;
  fullName: string;
  cpf: string;
  birth: string | null;
  gender: number;
  commissionPercentage?: number | null;
  address: Address;
  password?: string;
}
