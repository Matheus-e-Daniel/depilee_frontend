
import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/brand.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-brand-list',
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
    HasPermissionDirective
  ],
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss']
})
export class BrandListComponent implements OnInit {
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

  filteredBrands = computed(() => {
    let list = this.brands();
    const search = this.search().toLowerCase().trim();
    if (search) {
      list = list.filter(b => b.name.toLowerCase().includes(search));
    }
    if (this.sortOrder() === 'desc') {   
      list = [...list].sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else {
      list = [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }
    return list;
  });
  private destroyRef = inject(DestroyRef);
  private brandService = inject(BrandService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);
  private authService = inject(AuthService);

  brands = signal<Brand[]>([]);
  loading = signal(true);
  
  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  brandToDelete: { id: string; name: string } | null = null;

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading.set(true);

    this.brandService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.brands.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  editBrand(id: string): void {
    this.router.navigate(['/brands', id, 'edit']);
  }

  deleteBrand(id: string, name: string): void {
    this.brandToDelete = { id, name };
    this.showConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.brandToDelete) return;

    this.confirmationLoading.set(true);
    this.brandService.delete(this.brandToDelete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show('Marca excluída com sucesso!');
        this.loadBrands();
        this.brandToDelete = null;
      },
      error: () => {
        this.confirmationLoading.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmation.set(false);
    this.brandToDelete = null;
  }

  getDeleteMessage(): string {
    return `Tem certeza que deseja excluir "${this.brandToDelete?.name || ''}"? Esta ação não pode ser desfeita.`;
  }

  newBrand(): void {
    this.router.navigate(['/brands/new']);
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}

