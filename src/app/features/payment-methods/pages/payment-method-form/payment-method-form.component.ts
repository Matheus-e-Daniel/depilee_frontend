import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-method-form',
  templateUrl: './payment-method-form.component.html',
  styleUrls: ['./payment-method-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class PaymentMethodFormComponent {
  paymentMethodForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentMethodForm = this.fb.group({
      name: ['Cartão de Crédito', Validators.required],
      type: ['CreditCard', Validators.required],
      allowInstallments: [true],
      maxInstallments: [3, [Validators.required, Validators.min(1)]],
      interestRatePerInstallment: [0.05, [Validators.required, Validators.min(0)]],
      feePercentage: [2.5, [Validators.required, Validators.min(0)]],
      description: ['Aceita Visa e Mastercard']
    });
  }

  onSubmit() {
    if (this.paymentMethodForm.valid) {
      // Lógica para salvar o método de pagamento
      console.log(this.paymentMethodForm.value);
    }
  }
}
