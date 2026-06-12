import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterFormData } from '../../models/cash-register.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-cash-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TooltipModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './cash-register-form.component.html',
  styleUrls: ['./cash-register-form.component.scss']
})
export class CashRegisterFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private cashRegisterService = inject(CashRegisterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  cashRegisterForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  cashRegisterId = signal<string | null>(null);
  formSubmitted = signal(false);
  formModified = signal(false);
  originalFormValue: any = null;

  
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.cashRegisterForm = this.fb.group({
      initialBalance: ['', [Validators.required]],
      notes: ['']
    });

    this.cashRegisterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isEditMode() && this.originalFormValue) {
        this.checkFormModified();
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.cashRegisterId.set(id);
      this.loadCashRegister(id);
    }
  }

  private loadCashRegister(id: string): void {
    this.loading.set(true);
    this.cashRegisterService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cashRegister) => {
        
        const formattedBalance = cashRegister.initialBalance.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2
        });
        this.cashRegisterForm.patchValue({
          initialBalance: formattedBalance,
          notes: cashRegister.notes || ''
        });
        
        this.originalFormValue = JSON.stringify(this.cashRegisterForm.value);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar caixa'
        });
        this.router.navigate(['/cash-registers']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.cashRegisterForm.invalid) {
      return;
    }
    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formValue = this.cashRegisterForm.value;
 
    const initialBalanceValue = this.parseCurrency(formValue.initialBalance);

    const formData: CashRegisterFormData = {
      ...formValue,
      initialBalance: initialBalanceValue
    };

    const payload = this.isEditMode()
      ? { id: this.cashRegisterId(), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.cashRegisterService.update(payload)
      : this.cashRegisterService.create(payload);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Caixa atualizado com sucesso!'
            : 'Caixa criado com sucesso!'
        );
        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/cash-registers']);
        }, 2500);
      },
      error: () => {
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar caixa'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/cash-registers']);
  }

  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value.trim() === '') {
      input.value = 'R$ ';
    }
  }

  onCurrencyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value.startsWith('R$ ')) {
      input.value = 'R$ ' + input.value.replace(/^R\$\s*/, '');
    }
  }

  formatCurrencyOnBlur(event: FocusEvent, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    value = value.replace(/R\$\s*/g, '').trim();

    if (!value || value === '') {
      this.cashRegisterForm.get(controlName)?.setValue('');
      return;
    }
 
    value = value.replace(/\./g, '').replace(',', '.');

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      const formatted = numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      });
      this.cashRegisterForm.get(controlName)?.setValue(formatted);
    }
  }

  private parseCurrency(value: string): number {
    if (!value) return 0;    
    const cleaned = value.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  private checkFormModified(): void {
    const currentValue = JSON.stringify(this.cashRegisterForm.value);
    this.formModified.set(currentValue !== this.originalFormValue);
  }
}
