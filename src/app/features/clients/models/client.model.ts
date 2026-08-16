export interface Client {
  id: number;
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
  status: number;
  registrationDate: string;
  lastUpdate: string | null;
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
