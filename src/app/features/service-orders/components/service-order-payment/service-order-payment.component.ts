import { Component, Input, Output, EventEmitter, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CashRegisterService } from '../../../cash-registers/services/cash-register.service';
import { CashRegister } from '../../../cash-registers/models/cash-register.model';
import { ServiceOrderPaymentService } from './service-order-payment.service';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';

import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-service-order-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputNumberModule, InputTextModule, InputTextareaModule],
  templateUrl: './service-order-payment.component.html',
  styleUrls: ['./service-order-payment.component.scss']
})
export class ServiceOrderPaymentComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private cashRegisterService = inject(CashRegisterService);
  private paymentService = inject(ServiceOrderPaymentService);

  @Input() parentForm?: FormGroup;
  @Output() paymentChange = new EventEmitter<{
    cashRegisterId: number | null;
    paymentMethodId: number | null;
    amount: number | null;
    notes: string | null;
  }>();

  paymentForm!: FormGroup;
  paymentMethods = signal<PaymentMethod[]>([]);
  paymentMethodsLoading = signal(true);
  cashRegisters = signal<CashRegister[]>([]);
  cashRegistersLoading = signal(true);
  @Input() serviceOrderId?: number;

  ngOnInit(): void {
    this.loadCashRegisters();
    this.loadPaymentMethods();

    this.paymentForm = this.fb.group({
      cashRegisterId: [null, Validators.required],
      paymentMethodId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });

    this.paymentForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      this.paymentChange.emit(val);
    });

    if (this.parentForm) {
      this.parentForm.addControl('payment', this.paymentForm);
    }
  }

  private loadCashRegisters(): void {
    this.cashRegistersLoading.set(true);
    this.cashRegisterService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.cashRegisters.set(response.data);
        this.cashRegistersLoading.set(false);
      },
      error: () => {
        this.cashRegistersLoading.set(false);
      }
    });
  }

  private loadPaymentMethods(): void {
    this.paymentMethodsLoading.set(true);
    this.paymentService.getPaymentMethods().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.paymentMethods.set(response.data.filter(m => m.status === 1));
        this.paymentMethodsLoading.set(false);
      },
      error: () => {
        this.paymentMethodsLoading.set(false);
      }
    });
  }
}
