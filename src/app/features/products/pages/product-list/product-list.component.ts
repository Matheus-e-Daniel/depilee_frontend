// src/app/features/products/pages/product-list/product-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    DropdownModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  providers: [MessageService],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  allProducts = signal<Product[]>([]);
  loading = signal(true);

  // Filtros
  searchTerm = signal('');
  sortOrder = signal<string>('newest');

  sortOptions = [
    { label: 'Mais recente', value: 'newest' },
    { label: 'Mais antigo', value: 'oldest' },
    { label: 'Ordem alfabética (A-Z)', value: 'alphabetical' },
    { label: 'Status (Disponível primeiro)', value: 'status' }
  ];

  // Produtos filtrados e ordenados
  products = computed(() => {
    let filtered = this.allProducts();

    // Filtro por nome ou marca (case insensitive)
    const searchFilter = this.searchTerm().toLowerCase().trim();
    if (searchFilter) {
      filtered = filtered.filter(product => {
        const nameMatch = product.name?.toLowerCase().startsWith(searchFilter);
        const brandMatch = product.brandId?.toString().toLowerCase().startsWith(searchFilter);
        return nameMatch || brandMatch;
      });
    }

    // Ordenação
    const sorted = [...filtered];
    switch (this.sortOrder()) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
          const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
          const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        break;
      case 'status':
        // Disponíveis primeiro, depois esgotados, e dentro de cada grupo, ordem alfabética
        sorted.sort((a, b) => {
          if ((a.stock > 0) === (b.stock > 0)) {
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          }
          return a.stock > 0 ? -1 : 1;
        });
        break;
    }

    return sorted;
  });

  // Delete confirmation
  productToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (response) => {
        this.allProducts.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar produtos'
        });
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.sortOrder.set('newest');
  }


  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(id: string, name: string): void {
    this.productToDelete = { id, name };
  }

  getDeleteMessage(): string {
    return this.productToDelete ? `Tem certeza que deseja excluir "${this.productToDelete.name}"?` : '';
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.confirmationLoading.set(true);
    this.productService.delete(this.productToDelete.id).subscribe({
      next: () => {
        this.productToDelete = null;
        this.confirmationLoading.set(false);
        this.successModalService.show('Produto excluído com sucesso!');

        setTimeout(() => {
          this.successModalService.hide();
        }, 2500);

        this.loadProducts();
      },
      error: () => {
        this.productToDelete = null;
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir produto'
        });
      }
    });
  }

  cancelDelete(): void {
    this.productToDelete = null;
  }

  newProduct(): void {
    this.router.navigate(['/products/new']);
  }

  getSeverity(stock: number): 'success' | 'warning' | 'danger' {
    if (stock > 20) return 'success';
    if (stock > 0) return 'warning';
    return 'danger';
  }
}
