import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
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
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    InputTextModule,
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
  filteredProducts: Product[] = []; // 👈 PROPRIEDADE ADICIONADA
  loading = true;
  searchTerm = '';

  // Dados para os dropdowns
  categories = [
    { id: 1, name: 'Medicamento' },
    { id: 2, name: 'Equipamento' },
    { id: 3, name: 'Consumível' },
    { id: 4, name: 'Material Hospitalar' },
    { id: 5, name: 'Outros' }
  ];

  brands = [
    { id: 1, name: 'Johnson & Johnson' },
    { id: 2, name: 'Pfizer' },
    { id: 3, name: 'Roche' },
    { id: 4, name: 'Novartis' },
    { id: 5, name: 'Merck' },
    { id: 6, name: 'Sem Marca' }
  ];

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
        this.filteredProducts = products; // 👈 INICIALIZA filteredProducts
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);

        let errorDetail = 'Erro ao carregar produtos';
        if (error.message.includes('conexão')) {
          errorDetail = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message.includes('404')) {
          errorDetail = 'Endpoint não encontrado. Verifique a URL da API.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorDetail,
          life: 5000
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

            let errorDetail = 'Erro ao excluir produto';
            if (error.message.includes('404')) {
              errorDetail = 'Produto não encontrado.';
            } else if (error.message.includes('500')) {
              errorDetail = 'Erro no servidor. Tente novamente.';
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: errorDetail,
              life: 5000
            });
          }
        });
      }
    });
  }

  // 👇 MÉTODO PARA FILTRAR PRODUTOS - CORRIGIDO
  filterProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = this.products;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      // Verifica nome
      if (product.name.toLowerCase().includes(term)) {
        return true;
      }

      // Verifica descrição (se existir)
      if (product.description && product.description.toLowerCase().includes(term)) {
        return true;
      }

      // Verifica categoria
      const categoryName = this.getCategoryName(product.categoryId);
      if (categoryName.toLowerCase().includes(term)) {
        return true;
      }

      // Verifica marca
      const brandName = this.getBrandName(product.brandId);
      if (brandName.toLowerCase().includes(term)) {
        return true;
      }

      return false;
    });
  }

  // 👇 GETTER PARA BUSCA EM TEMPO REAL (Alternativa ao método acima)
  get filteredProductsRealTime(): Product[] {
    if (!this.searchTerm) return this.products;

    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product => {
      // Verifica nome
      if (product.name.toLowerCase().includes(term)) return true;

      // Verifica descrição (com verificação de null/undefined)
      if (product.description && product.description.toLowerCase().includes(term)) return true;

      // Verifica categoria
      const categoryName = this.getCategoryName(product.categoryId);
      if (categoryName.toLowerCase().includes(term)) return true;

      // Verifica marca
      const brandName = this.getBrandName(product.brandId);
      if (brandName.toLowerCase().includes(term)) return true;

      return false;
    });
  }

  // Métodos auxiliares para obter nomes
  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return 'Sem categoria';
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Desconhecida';
  }

  getBrandName(brandId: number | undefined): string {
    if (!brandId) return 'Sem marca';
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Desconhecida';
  }

  formatCurrency(value: number): string {
    return formatCurrency(value);
  }

  getStockSeverity(
  stock: number
): "success" | "warning" | "danger" {
  if (stock === 0) return "danger";
  if (stock < 10) return "warning";
  return "success";
}


  getStockLabel(stock: number): string {
    if (stock === 0) return 'Esgotado';
    if (stock < 10) return 'Baixo';
    return 'Disponível';
  }

  getStatusSeverity(
  status: string
): "success" | "danger" {
  return status === "active" ? "success" : "danger";
}


  getStatusLabel(status: string): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  // Método chamado quando o search term muda
  onSearchChange() {
    this.filteredProducts = this.filteredProductsRealTime;
  }
}
