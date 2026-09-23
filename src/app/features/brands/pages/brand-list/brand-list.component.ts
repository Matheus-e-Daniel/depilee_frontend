
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
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/brand.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
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
    TagModule,
    ConfirmationModalComponent,
    SuccessModalComponent
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
      list = [...list].sort((a, b) => b.id - a.id);
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }
    return list;
  });
  private destroyRef = inject(DestroyRef);
  private brandService = inject(BrandService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);

  brands = signal<Brand[]>([]);
  loading = signal(true);
  
  showConfirmation = signal(false);
  confirmationLoading = signal(false);
  brandToDelete: { id: number; name: string } | null = null;

  selectedBrands = signal<Brand[]>([]);
  bulkDeleteVisible = signal(false);
  bulkDeleteLoading = signal(false);

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
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar marcas');
      }
    });
  }

  editBrand(id: number): void {
    this.router.navigate(['/brands', id, 'edit']);
  }

  deleteBrand(id: number, name: string): void {
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
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadBrands();
        this.brandToDelete = null;
      },
      error: (err: HttpErrorResponse) => {
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao excluir marca');
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

  deleteSelected(): void {
    if (this.selectedBrands().length === 0) return;
    this.bulkDeleteVisible.set(true);
  }

  getBulkDeleteMessage(): string {
    return `Tem certeza que deseja excluir ${this.selectedBrands().length} marca(s) selecionada(s)?`;
  }

  confirmBulkDelete(): void {
    const brands = this.selectedBrands();
    if (brands.length === 0) return;

    this.bulkDeleteLoading.set(true);
    forkJoin(brands.map(brand => this.brandService.delete(brand.id)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.selectedBrands.set([]);
          this.successModalService.show('Marcas excluídas com sucesso!');
          setTimeout(() => this.successModalService.hide(), 1500);
          this.loadBrands();
        },
        error: (err: HttpErrorResponse) => {
          this.bulkDeleteVisible.set(false);
          this.bulkDeleteLoading.set(false);
          this.errorModalService.show(err.error?.message || 'Falha ao excluir marcas selecionadas');
        }
      });
  }

  cancelBulkDelete(): void {
    this.bulkDeleteVisible.set(false);
  }

  newBrand(): void {
    this.router.navigate(['/brands/new']);
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}

