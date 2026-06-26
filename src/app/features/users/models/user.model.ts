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
  birth: Date;
  gender: Gender;
  roleId?: string | null;
  role?: { id: string; name: string } | null;
  address: Address;
  commissionPercentage?: number | null;
}
