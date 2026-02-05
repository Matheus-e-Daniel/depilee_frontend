import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-method-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss']
})
export class PaymentMethodListComponent {
  // Lista fictícia para exemplo
  paymentMethods = [
    {
      name: 'Cartão de Crédito',
      type: 'CreditCard',
      allowInstallments: true,
      maxInstallments: 3,
      interestRatePerInstallment: 0.05,
      feePercentage: 2.5,
      description: 'Aceita Visa e Mastercard'
    }
  ];
}
