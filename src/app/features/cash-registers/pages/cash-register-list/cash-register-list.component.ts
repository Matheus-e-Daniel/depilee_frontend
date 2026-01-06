import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegister } from '../../models/cash-register.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { CashRegisterCloseFormComponent } from '../cash-register-close-form/cash-register-close-form.component';

@Component({
  selector: 'app-cash-register-list',
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
    SuccessModalComponent,
    CashRegisterCloseFormComponent
  ],
  providers: [MessageService],
  templateUrl: './cash-register-list.component.html',
  styleUrls: ['./cash-register-list.component.scss']
})
export class CashRegisterListComponent implements OnInit {
  // Filtro e ordenação
  search = signal('');
  sortOrder = signal<'desc' | 'asc'>('desc');
  sortOptions = [
    { label: 'Mais recente', value: 'desc' },
    { label: 'Mais antiga', value: 'asc' }
  ];

  get searchValue() {
    return this.search();
  }
  set searchValue(val: string) {
    this.search.set(val);
  }

  get sortOrderValue() {
    return this.sortOrder();
  }
  set sortOrderValue(val: 'desc' | 'asc') {
    this.sortOrder.set(val);
  }

  filteredCashRegisters = computed(() => {
    let list = this.cashRegisters();
    const search = this.search().toLowerCase().trim();
    if (search) {
      list = list.filter(c => (c.notes || '').toLowerCase().includes(search));
    }
    if (this.sortOrder() === 'desc') {
      list = [...list].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      list = [...list].sort((a, b) => a.id.localeCompare(b.id));
    }
    return list;
  });
  private cashRegisterService = inject(CashRegisterService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  cashRegisters = signal<CashRegister[]>([]);
  loading = signal(true);

  // Close cash register modal
  showCloseModal = signal(false);
  closeLoading = signal(false);
  cashRegisterToClose: { id: string; notes: string } | null = null;

  ngOnInit(): void {
    this.loadCashRegisters();
  }

  loadCashRegisters(): void {
    this.loading.set(true);
    this.cashRegisterService.getAll().subscribe({
      next: (response) => {
        this.cashRegisters.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar caixas'
        });
        this.loading.set(false);
      }
    });
  }

  editCashRegister(id: string): void {
    this.router.navigate(['/cash-registers', id, 'edit']);
  }

  openCloseCashRegisterModal(id: string, notes: string): void {
    this.cashRegisterToClose = { id, notes };
    this.showCloseModal.set(true);
    console.log('Abrindo modal de fechamento de caixa:', id, notes);
    this.messageService.add({
      severity: 'info',
      summary: 'Modal',
      detail: `Abrindo modal para caixa ${id}`
    });
  }

  confirmCloseCashRegister(data: { finalBalance: number; notes?: string }): void {
    if (!this.cashRegisterToClose) return;
    this.closeLoading.set(true);
    this.cashRegisterService.closeCashRegister({
      cashRegisterId: Number(this.cashRegisterToClose.id),
      finalBalance: data.finalBalance,
      notes: data.notes
    }).subscribe({
      next: () => {
        this.closeLoading.set(false);
        this.showCloseModal.set(false);
        this.successModalService.show('Caixa fechado com sucesso!');
        this.loadCashRegisters();
        this.cashRegisterToClose = null;
      },
      error: () => {
        this.closeLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao fechar caixa'
        });
      }
    });
  }

  cancelCloseCashRegister(): void {
    this.showCloseModal.set(false);
    this.cashRegisterToClose = null;
  }

  getCloseMessage(): string {
    return `Tem certeza que deseja fechar o caixa "${this.cashRegisterToClose?.notes || ''}"? Informe o saldo final e observações.`;
  }

  newCashRegister(): void {
    this.router.navigate(['/cash-registers/new']);
  }
}
