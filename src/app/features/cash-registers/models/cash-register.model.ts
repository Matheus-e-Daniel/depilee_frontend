export interface CashRegisterFormData {
  initialBalance: number;
  notes?: string;
}

export interface CashRegister extends CashRegisterFormData {
  CashRegisterStatus: number;
  id: string;
}
