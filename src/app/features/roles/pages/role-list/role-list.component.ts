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
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-role-list',
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
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
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
    return list;
  });

  private destroyRef = inject(DestroyRef);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  roles = signal<Role[]>([]);
  loading = signal(true);

  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  roleToDelete: string | null = null;

  selectedRoles = signal<Role[]>([]);
  bulkDeleteVisible = signal(false);
  bulkDeleteLoading = signal(false);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);

    this.roleService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar cargos');
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
    this.roleService.delete(this.roleToDelete).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show('Cargo excluído com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadRoles();
        this.roleToDelete = null;
      },
      error: (err: HttpErrorResponse) => {
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao excluir cargo');
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.roleToDelete = null;
  }

  deleteSelected(): void {
    if (this.selectedRoles().length === 0) return;
    this.bulkDeleteVisible.set(true);
  }

  getBulkDeleteMessage(): string {
    return `Tem certeza que deseja excluir ${this.selectedRoles().length} cargo(s) selecionado(s)?`;
  }

  confirmBulkDelete(): void {
    const roles = this.selectedRoles();
    if (roles.length === 0) return;

    this.bulkDeleteLoading.set(true);
    forkJoin(roles.map(role => this.roleService.delete(role.id as unknown as string)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.selectedRoles.set([]);
          this.successModalService.show('Cargos excluídos com sucesso!');
          setTimeout(() => this.successModalService.hide(), 1500);
          this.loadRoles();
        },
        error: (err: HttpErrorResponse) => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.errorModalService.show(err.error?.message || 'Falha ao excluir cargos selecionados');
        }
      });
  }

  cancelBulkDelete(): void {
    this.bulkDeleteVisible.set(false);
  }

  getDeleteMessage(): string {
    return `Tem certeza que deseja excluir "${this.roleToDelete || ''}"? Esta ação não pode ser desfeita.`;
  }

  newRole(): void {
    this.router.navigate(['/roles/new']);
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}
