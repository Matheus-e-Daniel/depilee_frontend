import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { RoleService } from '../../services/role.service';
import { RoleFormData, Permission } from '../../models/role.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface PermissionModule {
  name: string;
  displayName: string;
  permissions: { [action: string]: Permission | null };
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TooltipModule,
    CheckboxModule,
    TableModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  roleForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  roleId = signal<string | null>(null);
  formSubmitted = signal(false);
  formModified = signal(false);
  originalFormValue: any = null;

  availablePermissions = signal<Permission[]>([]);
  selectedPermissionIds = signal<Set<number>>(new Set());

  actions = ['Create', 'Edit', 'Get', 'Delete'];
  actionLabels: { [key: string]: string } = {
    'Create': 'Criar',
    'Edit': 'Editar',
    'Get': 'Visualizar',
    'Delete': 'Excluir'
  };

  permissionModules = computed<PermissionModule[]>(() => {
    const permissions = this.availablePermissions();
    const modulesMap = new Map<string, PermissionModule>();

    const moduleDisplayNames: { [key: string]: string } = {
      'Brand': 'Marcas',
      'CashFlow': 'Fluxo de Caixa',
      'CashRegister': 'Caixas',
      'Category': 'Categorias',
      'Client': 'Clientes',
      'Event': 'Eventos',
      'Notification': 'Notificações',
      'Payment': 'Pagamentos',
      'PaymentMethod': 'Métodos de Pagamento',
      'Product': 'Produtos',
      'Service': 'Serviços',
      'ServiceOrder': 'Ordens de Serviço',
      'ServiceOrderItem': 'Itens de OS',
      'StockMovement': 'Movimentação de Estoque'
    };

    permissions.forEach(permission => {
      const [moduleName, action] = permission.name.split('.');

      if (!modulesMap.has(moduleName)) {
        modulesMap.set(moduleName, {
          name: moduleName,
          displayName: moduleDisplayNames[moduleName] || moduleName,
          permissions: { Create: null, Edit: null, Get: null, Delete: null }
        });
      }

      const module = modulesMap.get(moduleName)!;
      module.permissions[action] = permission;
    });

    return Array.from(modulesMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  });

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadPermissions();
    this.checkEditMode();
  }

  private initForm(): void {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.roleForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isEditMode() && this.originalFormValue) {
        this.checkFormModified();
      }
    });
  }

  private loadPermissions(): void {
    this.roleService.getAllPermissions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (permissions) => {
        this.availablePermissions.set(permissions);
      },
      error: () => {
      }
    });
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionIds().has(permissionId);
  }

  togglePermission(permission: Permission | null): void {
    if (!permission) return;

    const selected = new Set(this.selectedPermissionIds());
    if (selected.has(permission.id)) {
      selected.delete(permission.id);
    } else {
      selected.add(permission.id);
    }
    this.selectedPermissionIds.set(selected);
    this.formModified.set(true);
  }

  isModuleFullySelected(module: PermissionModule): boolean {
    return this.actions.every(action => {
      const perm = module.permissions[action];
      return !perm || this.selectedPermissionIds().has(perm.id);
    });
  }

  toggleModuleAll(module: PermissionModule): void {
    const selected = new Set(this.selectedPermissionIds());
    const isFullySelected = this.isModuleFullySelected(module);

    this.actions.forEach(action => {
      const perm = module.permissions[action];
      if (perm) {
        if (isFullySelected) {
          selected.delete(perm.id);
        } else {
          selected.add(perm.id);
        }
      }
    });

    this.selectedPermissionIds.set(selected);
    this.formModified.set(true);
  }

  isActionFullySelected(action: string): boolean {
    const modules = this.permissionModules();
    return modules.every(module => {
      const perm = module.permissions[action];
      return !perm || this.selectedPermissionIds().has(perm.id);
    });
  }

  toggleActionAll(action: string): void {
    const selected = new Set(this.selectedPermissionIds());
    const isFullySelected = this.isActionFullySelected(action);

    this.permissionModules().forEach(module => {
      const perm = module.permissions[action];
      if (perm) {
        if (isFullySelected) {
          selected.delete(perm.id);
        } else {
          selected.add(perm.id);
        }
      }
    });

    this.selectedPermissionIds.set(selected);
    this.formModified.set(true);
  }

  isAllSelected(): boolean {
    const permissions = this.availablePermissions();
    return permissions.length > 0 && permissions.every(p => this.selectedPermissionIds().has(p.id));
  }

  toggleAll(): void {
    const selected = new Set(this.selectedPermissionIds());
    const isAllSelected = this.isAllSelected();

    this.availablePermissions().forEach(perm => {
      if (isAllSelected) {
        selected.delete(perm.id);
      } else {
        selected.add(perm.id);
      }
    });

    this.selectedPermissionIds.set(selected);
    this.formModified.set(true);
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  private loadRole(id: string): void {
    this.loading.set(true);

    this.roleService.getRolePermissionsById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (permissions) => {
        const selectedIds = new Set(permissions.map((p: any) => p.id));
        this.selectedPermissionIds.set(selectedIds);

        this.roleService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (roles) => {
            const role = roles.find(r => r.id.toString() === id);
            if (role) {
              this.roleForm.patchValue({
                roleName: role.name
              });

              this.originalFormValue = JSON.stringify(this.roleForm.value);
            }
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/roles']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.roleForm.invalid) {
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData = this.roleForm.value;
    const roleName = formData.roleName;
    const permissionIds: number[] = Array.from(this.selectedPermissionIds());

    const rolePayload: RoleFormData = { roleName };

    const createOrUpdateRole = this.isEditMode()
      ? this.roleService.update({ id: this.roleId(), ...rolePayload })
      : this.roleService.create(rolePayload);

    createOrUpdateRole.pipe(
      switchMap(() => {
        if (permissionIds.length > 0) {
          return this.roleService.assignPermissions({ roleName, permissionIds });
        }
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Cargo atualizado com sucesso!'
            : 'Cargo criado com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/roles']);
        }, 2500);
      },
      error: () => {
        this.confirmationLoading.set(false);
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/roles']);
  }

  private checkFormModified(): void {
    const currentValue = JSON.stringify(this.roleForm.value);
    this.formModified.set(currentValue !== this.originalFormValue);
  }
}
