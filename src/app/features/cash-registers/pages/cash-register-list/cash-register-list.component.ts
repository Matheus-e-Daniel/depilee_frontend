import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegister } from '../../models/cash-register.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { CashRegisterCloseFormComponent } from '../cash-register-close-form/cash-register-close-form.component';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cash-register-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    DropdownModule,
    ConfirmationModalComponent,
    SuccessModalComponent,
    CashRegisterCloseFormComponent
  ],
  templateUrl: './cash-register-list.component.html',
  styleUrls: ['./cash-register-list.component.scss']
})
export class CashRegisterListComponent implements OnInit {  
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
      list = [...list].sort((a, b) => b.id - a.id);
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }
    return list;
  });
  private destroyRef = inject(DestroyRef);
  private cashRegisterService = inject(CashRegisterService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  cashRegisters = signal<CashRegister[]>([]);
  loading = signal(true);
 
  showCloseModal = signal(false);
  closeLoading = signal(false);
  cashRegisterToClose: { id: number; notes: string } | null = null;

  ngOnInit(): void {
    this.loadCashRegisters();
  }

  loadCashRegisters(): void {
    this.loading.set(true);
    this.cashRegisterService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.cashRegisters.set(response.data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar caixas');
      }
    });
  }

  editCashRegister(id: number): void {
    this.router.navigate(['/cash-registers', id, 'edit']);
  }

  openCloseCashRegisterModal(id: number, notes: string): void {
    this.cashRegisterToClose = { id, notes };
    this.showCloseModal.set(true);
  }

  confirmCloseCashRegister(data: { finalBalance: number; notes?: string }): void {
    if (!this.cashRegisterToClose) return;
    this.closeLoading.set(true);
    this.cashRegisterService.closeCashRegister({
      cashRegisterId: this.cashRegisterToClose.id,
      finalBalance: data.finalBalance,
      notes: data.notes
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.closeLoading.set(false);
        this.showCloseModal.set(false);
        this.successModalService.show('Caixa fechado com sucesso!');
        this.loadCashRegisters();
        this.cashRegisterToClose = null;
      },
      error: (err: HttpErrorResponse) => {
        this.closeLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao fechar caixa');
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

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}
