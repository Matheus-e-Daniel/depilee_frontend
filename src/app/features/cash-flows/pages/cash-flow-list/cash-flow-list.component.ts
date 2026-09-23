import { UtcDatePipe } from '../../../../shared/pipes/utc-date.pipe';
import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CashFlowService } from '../../services/cash-flow.service';
import { CashFlow, ECashFlowType } from '../../models/cash-flow.model';
import { CashRegisterService } from '../../../cash-registers/services/cash-register.service';
import { CashRegister } from '../../../cash-registers/models/cash-register.model';
import { PaymentMethodService } from '../../../payment-methods/services/payment-method.service';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cash-flow-list',
  standalone: true,
  imports: [UtcDatePipe, 
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    TooltipModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './cash-flow-list.component.html',
  styleUrls: ['./cash-flow-list.component.scss']
})
export class CashFlowListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cashFlowService = inject(CashFlowService);
  private cashRegisterService = inject(CashRegisterService);
  private paymentMethodService = inject(PaymentMethodService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);
  private fb = inject(FormBuilder);

  readonly ECashFlowType = ECashFlowType;

  cashRegisterId = 0;
  cashRegister = signal<CashRegister | null>(null);
  cashFlows = signal<CashFlow[]>([]);
  loading = signal(true);
  paymentMethods = signal<PaymentMethod[]>([]);

  entryForm: FormGroup = this.fb.group({
    type: [ECashFlowType.In, Validators.required],
    value: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    description: ['']
  });
  formSubmitted = signal(false);
  saving = signal(false);

  typeOptions = [
    { label: 'Entrada', value: ECashFlowType.In },
    { label: 'Saída', value: ECashFlowType.Out }
  ];

  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  cashFlowToDelete: { id: number; description: string } | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('cashRegisterId');
    if (!id) {
      this.router.navigate(['/cash-registers']);
      return;
    }
    this.cashRegisterId = Number(id);
    this.loadCashRegister();
    this.loadCashFlows();
    this.loadPaymentMethods();
  }

  private loadPaymentMethods(): void {
    this.paymentMethodService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => this.paymentMethods.set(response.data.filter(m => m.status === 1)),
      error: (err: HttpErrorResponse) => this.errorModalService.show(err.error?.message || 'Falha ao carregar formas de pagamento')
    });
  }

  private loadCashRegister(): void {
    this.cashRegisterService.getById(this.cashRegisterId.toString()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => this.cashRegister.set(data),
      error: (err) => this.errorModalService.show(err.error?.message || 'Falha ao carregar caixa')
    });
  }

  loadCashFlows(): void {
    this.loading.set(true);
    this.cashFlowService.getAllByCashRegister(this.cashRegisterId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.cashFlows.set(response.data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar lançamentos de caixa');
      }
    });
  }

  get totalEntradas(): number {
    return this.cashFlows().filter(f => f.type === ECashFlowType.In).reduce((sum, f) => sum + f.value, 0);
  }

  get totalSaidas(): number {
    return this.cashFlows().filter(f => f.type === ECashFlowType.Out).reduce((sum, f) => sum + f.value, 0);
  }

  getTypeLabel(type: ECashFlowType): string {
    return type === ECashFlowType.In ? 'Entrada' : 'Saída';
  }

  submitEntry(): void {
    this.formSubmitted.set(true);
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.entryForm.value;

    this.cashFlowService.create({
      cashRegisterId: this.cashRegisterId,
      type: value.type,
      value: value.value,
      paymentMethodId: value.paymentMethodId,
      description: value.description || undefined
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.formSubmitted.set(false);
        this.entryForm.reset({ type: ECashFlowType.In, value: null, paymentMethodId: null, description: '' });
        this.successModalService.show('Lançamento registrado com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadCashFlows();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao registrar lançamento');
      }
    });
  }

  deleteCashFlow(id: number, description: string): void {
    this.cashFlowToDelete = { id, description: description || 'lançamento' };
    this.showConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.cashFlowToDelete) return;

    this.confirmationLoading.set(true);
    this.cashFlowService.delete(this.cashFlowToDelete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show('Lançamento excluído com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.cashFlowToDelete = null;
        this.loadCashFlows();
      },
      error: (err: HttpErrorResponse) => {
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao excluir lançamento');
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.cashFlowToDelete = null;
  }

  getDeleteMessage(): string {
    return this.cashFlowToDelete ? `Tem certeza que deseja excluir "${this.cashFlowToDelete.description}"?` : '';
  }

  onBack(): void {
    this.router.navigate(['/cash-registers']);
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}
