// src/app/features/products/pages/product-list/product-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
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
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
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

  products = signal<Product[]>([]);
  loading = signal(true);

  // Delete confirmation
  productToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
    console.log(this.products());
  }

  loadProducts(): void {
  this.loading.set(true);

  this.productService.getAll().subscribe({
    next: (response) => {
      this.products.set(response.data); // <--- aqui está a correção
      this.loading.set(false);

      console.log('Produtos carregados:', response.data);
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
