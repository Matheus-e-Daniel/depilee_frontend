import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-payment-method-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToastModule,
    TooltipModule,
    DropdownModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  providers: [MessageService],
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss']
})
export class PaymentMethodListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private paymentMethodService = inject(PaymentMethodService);
  private messageService = inject(MessageService);
  private router = inject(Router);
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
        sorted.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
    }

    return sorted;
  });

  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  paymentMethodToDelete: string | null = null;

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading.set(true);

    this.paymentMethodService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (paymentMethods) => {
        this.allPaymentMethods.set(paymentMethods);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar métodos de pagamento'
        });
        this.loading.set(false);
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
        this.loadPaymentMethods();
      },
      error: () => {
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir método de pagamento'
        });
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.paymentMethodToDelete = null;
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
    const types: { [key: number]: string } = {
      0: 'Dinheiro',
      1: 'Cartão de Crédito',
      2: 'Cartão de Débito',
      3: 'PIX',
      4: 'Boleto',
      5: 'Transferência'
    };
    return types[type] || 'Desconhecido';
  }
}
