export interface Client {
  id: number;
  name: string;
  gender: number | null;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  birth: string | null;
  address: {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
  } | null;
  status: number;
  creditBalance: number;
  registrationDate: string;
  lastUpdate: string | null;
}

export interface ClientQuickCreateData {
  name: string;
  phone?: string;
  birth?: string;
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
