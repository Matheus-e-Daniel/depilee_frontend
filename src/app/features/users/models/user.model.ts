export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

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
  id: string;
  email: string;
  fullName: string;
  password: string;
  cpf: string;
  birth: string;
  gender: Gender;
  roleId?: string | null;
  roles?: { id: string; name: string }[];
  address: Address;
  commissionPercentage?: number | null;
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
