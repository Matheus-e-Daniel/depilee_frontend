// src/app/features/roles/pages/role-list/role-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-role-list',
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
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
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

  filteredRoles = computed(() => {
    let list = this.roles();
    console.log('🔍 Lista de roles no computed:', list);
    const search = this.search().toLowerCase().trim();
    if (search) {
      list = list.filter(r => r?.name?.toLowerCase().includes(search));
    }
    if (this.sortOrder() === 'desc') {
      list = [...list].sort((a, b) => {
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return nameB.localeCompare(nameA);
      });
    } else {
      list = [...list].sort((a, b) => {
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return nameA.localeCompare(nameB);
      });
    }
    console.log('🔍 Lista filtrada/ordenada:', list);
    return list;
  });

  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  roles = signal<Role[]>([]);
  loading = signal(true);

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  roleToDelete: string | null = null;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);

    this.roleService.getAll().subscribe({
      next: (roles) => {
        console.log('📋 Resposta do backend (roles):', roles);
        console.log('📋 Tipo da resposta:', typeof roles);
        console.log('📋 É array?', Array.isArray(roles));
        if (roles && roles.length > 0) {
          console.log('📋 Primeiro item:', roles[0]);
          console.log('📋 Estrutura do primeiro item:', JSON.stringify(roles[0], null, 2));
        }
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar cargos'
        });
        this.loading.set(false);
      }
    });
  }

  editRole(roleName: string): void {
    this.router.navigate(['/roles', roleName, 'edit']);
  }

  deleteRole(roleName: string): void {
    this.roleToDelete = roleName;
    this.showConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;

    this.confirmationLoading.set(true);
    this.roleService.delete(this.roleToDelete).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show('Cargo excluído com sucesso!');
        this.loadRoles();
        this.roleToDelete = null;
      },
      error: () => {
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir cargo'
        });
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.roleToDelete = null;
  }

  getDeleteMessage(): string {
    return `Tem certeza que deseja excluir "${this.roleToDelete || ''}"? Esta ação não pode ser desfeita.`;
  }

  newRole(): void {
    this.router.navigate(['/roles/new']);
  }
}
