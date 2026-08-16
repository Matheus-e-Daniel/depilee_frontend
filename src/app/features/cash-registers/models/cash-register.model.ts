export interface CashRegisterFormData {
  initialBalance: number;
  notes?: string;
}

export interface CashRegister extends CashRegisterFormData {
  cashRegisterStatus: number;
  id: number;
}
