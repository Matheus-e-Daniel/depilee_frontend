import { Component, OnInit, inject, signal } from '@angular/core';
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

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.cashRegisterForm = this.fb.group({
      initialBalance: [0.0, [Validators.required]],
      notes: ['']
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
    this.cashRegisterService.getById(id).subscribe({
      next: (cashRegister) => {
        this.cashRegisterForm.patchValue({
          initialBalance: cashRegister.initialBalance,
          notes: cashRegister.notes || ''
        });
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
    if (this.cashRegisterForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: CashRegisterFormData = this.cashRegisterForm.value;

    const payload = this.isEditMode()
      ? { id: this.cashRegisterId(), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.cashRegisterService.update(payload)
      : this.cashRegisterService.create(payload);

    operation.subscribe({
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

  private markFormGroupTouched(): void {
    Object.values(this.cashRegisterForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
