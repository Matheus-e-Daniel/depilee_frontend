import { PaymentMethod } from '../../payment-methods/models/payment-method.model';

export interface CashRegisterFormData {
  initialBalance: number;
  notes?: string;
}

export interface PaymentMethodDeclaration {
  paymentMethodId: number;
  declaredAmount: number;
}

export interface CashRegisterClosingDetail {
  id: number;
  cashRegisterId: number;
  paymentMethodId: number;
  paymentMethod?: PaymentMethod;
  declaredAmount: number;
  calculatedAmount: number;
  difference: number;
}

export interface CashRegister extends CashRegisterFormData {
  cashRegisterStatus: number;
  id: number;
  finalBalance: number;
  difference?: number;
  closingDetails: CashRegisterClosingDetail[];
}
