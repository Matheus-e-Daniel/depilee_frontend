import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-payment-method-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    DropdownModule,
    TagModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss']
})
export class PaymentMethodListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private paymentMethodService = inject(PaymentMethodService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  allPaymentMethods = signal<PaymentMethod[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  sortOrder = signal<string>('newest');

  sortOptions = [
    { label: 'Mais recente', value: 'newest' },
    { label: 'Mais antigo', value: 'oldest' },
    { label: 'Nome (A-Z)', value: 'alphabetical' }
  ];

  paymentMethods = computed(() => {
    let filtered = this.allPaymentMethods();

    const searchFilter = this.searchTerm().toLowerCase().trim();
    if (searchFilter) {
      filtered = filtered.filter(pm =>
        pm.name?.toLowerCase().includes(searchFilter)
      );
    }

    const sorted = [...filtered];
    switch (this.sortOrder()) {
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.registrationDate || '').getTime() - new Date(b.registrationDate || '').getTime());
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.registrationDate || '').getTime() - new Date(a.registrationDate || '').getTime());
        break;
    }

    return sorted;
  });

  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  paymentMethodToDelete: number | null = null;

  selectedPaymentMethods = signal<PaymentMethod[]>([]);
  bulkDeleteVisible = signal(false);
  bulkDeleteLoading = signal(false);

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading.set(true);

    this.paymentMethodService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.allPaymentMethods.set(response.data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar métodos de pagamento');
      }
    });
  }

  newPaymentMethod(): void {
    this.router.navigate(['/payment-methods/new']);
  }

  editPaymentMethod(paymentMethod: PaymentMethod): void {
    this.router.navigate(['/payment-methods/edit', paymentMethod.id]);
  }

  deletePaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethodToDelete = paymentMethod.id;
    this.showConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.paymentMethodToDelete) return;

    this.confirmationLoading.set(true);
    this.paymentMethodService.delete(this.paymentMethodToDelete).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show('Método de pagamento excluído com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadPaymentMethods();
      },
      error: (err: HttpErrorResponse) => {
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao excluir método de pagamento');
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.paymentMethodToDelete = null;
  }

  deleteSelected(): void {
    if (this.selectedPaymentMethods().length === 0) return;
    this.bulkDeleteVisible.set(true);
  }

  getBulkDeleteMessage(): string {
    return `Tem certeza que deseja excluir ${this.selectedPaymentMethods().length} método(s) de pagamento selecionado(s)?`;
  }

  confirmBulkDelete(): void {
    const paymentMethods = this.selectedPaymentMethods();
    if (paymentMethods.length === 0) return;

    this.bulkDeleteLoading.set(true);
    forkJoin(paymentMethods.map(pm => this.paymentMethodService.delete(pm.id)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.selectedPaymentMethods.set([]);
          this.successModalService.show('Métodos de pagamento excluídos com sucesso!');
          setTimeout(() => this.successModalService.hide(), 1500);
          this.loadPaymentMethods();
        },
        error: (err: HttpErrorResponse) => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.errorModalService.show(err.error?.message || 'Falha ao excluir métodos de pagamento selecionados');
        }
      });
  }

  cancelBulkDelete(): void {
    this.bulkDeleteVisible.set(false);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.sortOrder.set('newest');
  }

  getDeleteMessage(): string {
    const paymentMethod = this.allPaymentMethods().find(pm => pm.id === this.paymentMethodToDelete);
    return paymentMethod
      ? `Tem certeza que deseja excluir o método de pagamento "${paymentMethod.name}"?`
      : 'Tem certeza que deseja excluir este método de pagamento?';
  }

  getPaymentTypeLabel(type: number): string {
    const types: Record<number, string> = {
      1: 'Dinheiro',
      2: 'Cartão de Crédito',
      3: 'Cartão de Débito',
      4: 'PIX',
      5: 'Transferência Bancária',
      6: 'Cheque',
      99: 'Outro'
    };
    return types[type] || 'Desconhecido';
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}
