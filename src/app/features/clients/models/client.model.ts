export interface Client {
  id: string;
  name: string;
  gender: number;
  cpf: string;
  phone: string;
  email: string;
  birth: string;
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
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  gender: number;
  cpf: string;
  phone: string;
  email: string;
  birth: string;
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
