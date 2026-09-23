import { Component, Input, Output, EventEmitter, inject, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { PaymentMethodService } from '../../../payment-methods/services/payment-method.service';
import { PaymentMethodDeclaration } from '../../models/cash-register.model';

@Component({
  selector: 'app-cash-register-close-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './cash-register-close-form.component.html',
  styleUrls: ['./cash-register-close-form.component.scss']
})
export class CashRegisterCloseFormComponent implements OnChanges {
  @Input() visible = false;
  @Input() loading = false;
  @Input() cashRegisterId!: number;
  @Output() confirm = new EventEmitter<{ declaredAmounts: PaymentMethodDeclaration[]; notes?: string }>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private paymentMethodService = inject(PaymentMethodService);

  loadingPaymentMethods = signal(false);

  form = this.fb.group({
    declarations: this.fb.array<ReturnType<typeof this.buildDeclarationGroup>>([]),
    notes: ['']
  });

  get declarations(): FormArray {
    return this.form.get('declarations') as FormArray;
  }

  private buildDeclarationGroup(paymentMethodId: number, paymentMethodName: string) {
    return this.fb.group({
      paymentMethodId: [paymentMethodId],
      paymentMethodName: [paymentMethodName],
      declaredAmount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  getTotal(): number {
    return this.declarations.controls.reduce((sum, c) => sum + (Number(c.get('declaredAmount')?.value) || 0), 0);
  }

  ngOnChanges(): void {
    if (this.visible) {
      this.form.get('notes')?.reset('');
      this.loadPaymentMethods();
    }
  }

  private loadPaymentMethods(): void {
    this.loadingPaymentMethods.set(true);
    this.paymentMethodService.getAll().subscribe({
      next: (response) => {
        this.declarations.clear();
        for (const method of response.data.filter(m => m.status === 1)) {
          this.declarations.push(this.buildDeclarationGroup(method.id, method.name));
        }
        this.loadingPaymentMethods.set(false);
      },
      error: () => this.loadingPaymentMethods.set(false)
    });
  }

  onConfirm(): void {
    if (this.form.valid && this.declarations.length > 0) {
      this.confirm.emit({
        declaredAmounts: this.declarations.value.map((d: { paymentMethodId: number; declaredAmount: number }) => ({
          paymentMethodId: d.paymentMethodId,
          declaredAmount: Number(d.declaredAmount) || 0
        })),
        notes: this.form.value.notes ?? undefined
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
