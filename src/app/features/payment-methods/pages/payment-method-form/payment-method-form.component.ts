import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethodFormData, PaymentMethod } from '../../models/payment-method.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-payment-method-form',
  templateUrl: './payment-method-form.component.html',
  styleUrls: ['./payment-method-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
})
export class PaymentMethodFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private paymentMethodService = inject(PaymentMethodService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  paymentMethodForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  paymentMethodId = signal<string | null>(null);
  formSubmitted = signal(false);

  paymentTypes = [
    { label: 'Dinheiro', value: 0 },
    { label: 'Cartão de Crédito', value: 1 },
    { label: 'Cartão de Débito', value: 2 },
    { label: 'PIX', value: 3 },
    { label: 'Boleto', value: 4 },
    { label: 'Transferência', value: 5 }
  ];

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.paymentMethodForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: [0, [Validators.required]],
      installments: [1, [Validators.required, Validators.min(1)]],
      interestRatePerInstallment: [0, [Validators.required, Validators.min(0)]],
      feePercentage: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.paymentMethodId.set(id);
      this.loadPaymentMethod(id);
    }
  }

  private loadPaymentMethod(id: string): void {
    this.loading.set(true);
    this.paymentMethodService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paymentMethod) => {
        this.paymentMethodForm.patchValue({
          name: paymentMethod.name,
          type: paymentMethod.type,
          installments: paymentMethod.installments,
          interestRatePerInstallment: paymentMethod.interestRatePerInstallment,
          feePercentage: paymentMethod.feePercentage,
          description: paymentMethod.description
        });
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/payment-methods']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.paymentMethodForm.invalid) {
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: PaymentMethodFormData = this.paymentMethodForm.value;

    if (this.isEditMode() && this.paymentMethodId()) {
      const updatedPaymentMethod: PaymentMethod = {
        id: this.paymentMethodId()!,
        ...formData
      };

      this.paymentMethodService.update(updatedPaymentMethod).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.confirmationLoading.set(false);
          this.showConfirmation.set(false);
          this.successModalService.show('Método de pagamento atualizado com sucesso!');
          setTimeout(() => {
            this.router.navigate(['/payment-methods']);
          }, 1500);
        },
        error: () => {
          this.confirmationLoading.set(false);
        }
      });
    } else {
      this.paymentMethodService.create(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.confirmationLoading.set(false);
          this.showConfirmation.set(false);
          this.successModalService.show('Método de pagamento criado com sucesso!');
          setTimeout(() => {
            this.router.navigate(['/payment-methods']);
          }, 1500);
        },
        error: () => {
          this.confirmationLoading.set(false);
        }
      });
    }
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  cancel(): void {
    this.router.navigate(['/payment-methods']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentMethodForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted()));
  }
}
