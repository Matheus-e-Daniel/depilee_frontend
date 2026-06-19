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
  email: string;
  fullName: string;
  password: string;
  cpf: string;
  birth: Date;
  gender: Gender;
  address: Address;
  commissionPercentage?: number | null;
}
