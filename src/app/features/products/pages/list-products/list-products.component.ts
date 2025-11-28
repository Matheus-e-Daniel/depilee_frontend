import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 ADICIONAR FormsModule
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
// REMOVER IconFieldModule e InputIconModule (não existem na versão atual)
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/product.interface';
import { getCategoryName, formatCurrency } from '../../utils/product.utils';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // 👈 ADICIONAR FormsModule para ngModel
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    InputTextModule,
    // REMOVER IconFieldModule e InputIconModule
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ListProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = true;
  searchTerm = '';

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {}

  loadProducts() {
    this.loading = true;
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar produtos'
        });
        this.loading = false;
      }
    });
  }

  onAddProduct() {
    this.router.navigate(['/products/new']);
  }

  onEditProduct(product: Product) {
    this.router.navigate(['/products/edit', product.id]);
  }

  onDeleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o produto <strong>"${product.name}"</strong>? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.productsService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto excluído com sucesso'
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Erro ao excluir produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir produto'
            });
          }
        });
      }
    });
  }

  getCategoryLabel(categoryValue: string): string {
    return getCategoryName(categoryValue as unknown as number);
  }

  formatCurrency(value: number): string {
    return formatCurrency(value);
  }

  // CORREÇÃO: Usar 'warning' em vez de 'warn'
  getStockSeverity(stock: number): any {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning'; // 👈 MUDAR para 'warning'
    return 'success';
  }

  getStockLabel(stock: number): string {
    if (stock === 0) return 'Esgotado';
    if (stock < 10) return 'Baixo';
    return 'Disponível';
  }

  // CORREÇÃO: Tipo correto
  getStatusSeverity(status: string): any {
    return status === 'active' ? 'success' : 'danger';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  // Filtro local para busca
  /*get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;

    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      this.getCategoryLabel(product.categoryId).toLowerCase().includes(term)
    );
  }*/
}
