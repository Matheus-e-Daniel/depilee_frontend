import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-category-list',
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
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
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

  filteredCategories = computed(() => {
    let list = this.categories();
    const search = this.search().toLowerCase().trim();
    if (search) {
      list = list.filter(c => c.name.toLowerCase().includes(search));
    }
    if (this.sortOrder() === 'desc') {
      list = [...list].sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else {
      list = [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }
    return list;
  });
  private destroyRef = inject(DestroyRef);
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  categories = signal<Category[]>([]);
  loading = signal(true);

  categoryToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);

    this.categoryService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar categorias'
        });
        this.loading.set(false);
      }
    });
  }

  editCategory(id: string): void {
    this.router.navigate(['/categories', id, 'edit']);
  }

  deleteCategory(id: string, name: string): void {
    this.categoryToDelete = { id, name };
  }

  getDeleteMessage(): string {
    return this.categoryToDelete ? `Tem certeza que deseja excluir "${this.categoryToDelete.name}"?` : '';
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.confirmationLoading.set(true);
    this.categoryService.delete(this.categoryToDelete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.categoryToDelete = null;
        this.confirmationLoading.set(false);
        this.successModalService.show('Categoria excluída com sucesso!');

        setTimeout(() => {
          this.successModalService.hide();
        }, 2500);

        this.loadCategories();
      },
      error: () => {
        this.categoryToDelete = null;
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir categoria'
        });
      }
    });
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
  }

  newCategory(): void {
    this.router.navigate(['/categories/new']);
  }
}

