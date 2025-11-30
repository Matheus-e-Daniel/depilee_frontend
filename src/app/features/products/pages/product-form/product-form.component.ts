import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ProductsService } from '../../services/products.service';
import { Product, ProductFormData } from '../../interfaces/product.interface';
import { PRODUCT_CATEGORIES, PRODUCT_BRANDS, PRODUCT_STATUS, calculateProfitMargin } from '../../utils/product.utils';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    InputTextareaModule,
    ToastModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  providers: [MessageService]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  mode: 'create' | 'edit' = 'create';
  productId: number | null = null;
  loading = false;
  submitting = false;

  categories = PRODUCT_CATEGORIES;
  brands = PRODUCT_BRANDS;
  statusOptions = PRODUCT_STATUS; // 👈 Opções de status
  profitMargin = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private messageService: MessageService
  ) {
    this.productForm = this.createForm();
    this.setupFormListeners();
  }

  ngOnInit() {
    console.log('🔄 ProductFormComponent inicializado');
    console.log('📊 Formulário inicial:', this.productForm.value);
    this.determineMode();
  }

  ngOnDestroy() {
    console.log('🧹 ProductFormComponent destruído');
  }

  determineMode() {
    const id = this.route.snapshot.params['id'];
    console.log('🔍 Determinando modo. Parâmetro ID:', id);

    if (id) {
      this.mode = 'edit';
      this.productId = +id;
      console.log(`📝 Modo: EDITAR - Produto ID: ${this.productId}`);
      this.loadProduct();
    } else {
      this.mode = 'create';
      console.log('📝 Modo: CRIAR - Novo produto');
    }
  }

  createForm(): FormGroup {
    console.log('📋 Criando formulário...');
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      brandId: [null],
      categoryId: [null],
      status: ['active', Validators.required], // 👈 CAMPO OBRIGATÓRIO ADICIONADO
      createdByUser: ['admin', Validators.required],
      updatedByUser: ['admin', Validators.required]
    });
  }

  setupFormListeners() {
    this.productForm.get('cost')?.valueChanges.subscribe(() => this.calculateProfit());
    this.productForm.get('salePrice')?.valueChanges.subscribe(() => this.calculateProfit());
  }

  calculateProfit() {
    const cost = this.productForm.get('cost')?.value || 0;
    const salePrice = this.productForm.get('salePrice')?.value || 0;
    this.profitMargin = calculateProfitMargin(cost, salePrice);
    console.log('💰 Margem de lucro calculada:', this.profitMargin + '%');
  }

  loadProduct() {
    if (!this.productId) return;

    console.log(`📦 Carregando produto ID: ${this.productId}...`);
    this.loading = true;

    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        console.log('✅ Produto carregado com sucesso:', product);

        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          stock: product.stock,
          cost: product.cost,
          salePrice: product.salePrice,
          brandId: product.brandId,
          categoryId: product.categoryId,
          status: product.status, // 👈 CAMPO OBRIGATÓRIO ADICIONADO
          updatedByUser: 'admin'
        });

        this.loading = false;
        console.log('📊 Formulário após carregar produto:', this.productForm.value);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar produto: ' + error.message
        });
        this.loading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit() {
    console.log('🟡 BOTÃO CLICADO - Iniciando onSubmit...');
    console.log('📝 Estado atual do formulário:', this.productForm.value);
    console.log('✅ Formulário válido?', this.productForm.valid);

    if (this.productForm.invalid) {
      console.log('❌ FORMULÁRIO INVÁLIDO - Erros detalhados:');
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          console.log(`  - ${key}:`, control.errors);
        }
      });

      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulário inválido',
        detail: 'Por favor, preencha todos os campos obrigatórios corretamente'
      });
      return;
    }

    console.log('✅ FORMULÁRIO VÁLIDO - Processando envio...');
    this.submitting = true;

    const formData: ProductFormData = this.productForm.value;

    // 👇 LOG DETALHADO do payload completo
    console.log('🎯 DADOS QUE SERÃO ENVIADOS PARA API (COMPLETO):');
    console.log('=========================================');
    console.log('📤 FORMATO COMPLETO (JSON):', JSON.stringify({
      createdByUser: formData.createdByUser,
      updatedByUser: formData.updatedByUser,
      name: formData.name,
      description: formData.description || '',
      stock: Number(formData.stock),
      cost: Number(formData.cost),
      salePrice: Number(formData.salePrice),
      brandId: formData.brandId || 0,
      categoryId: formData.categoryId || 0,
      status: formData.status // 👈 CAMPO OBRIGATÓRIO ADICIONADO
    }, null, 2));
    console.log('=========================================\n');

    if (this.mode === 'create') {
      this.createProduct(formData);
    } else {
      this.updateProduct(formData);
    }
  }

  createProduct(formData: ProductFormData) {
    console.log('🚀 Criando novo produto...');

    this.productsService.createProduct(formData).subscribe({
      next: (product) => {
        console.log('✅ PRODUTO CRIADO COM SUCESSO:', product);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto criado com sucesso!'
        });

        setTimeout(() => {
          console.log('🔄 Redirecionando para lista de produtos...');
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao criar produto:', error);
        this.handleApiError(error, 'criar');
        this.submitting = false;
      }
    });
  }

  updateProduct(formData: ProductFormData) {
    if (!this.productId) return;

    console.log(`✏️ Atualizando produto ID: ${this.productId}...`);

    this.productsService.updateProduct(this.productId, formData).subscribe({
      next: (product) => {
        console.log('✅ PRODUTO ATUALIZADO COM SUCESSO:', product);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto atualizado com sucesso!'
        });

        setTimeout(() => {
          console.log('🔄 Redirecionando para lista de produtos...');
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar produto:', error);
        this.handleApiError(error, 'atualizar');
        this.submitting = false;
      }
    });
  }

  private handleApiError(error: any, operation: string) {
    console.error(`💥 Erro na operação ${operation}:`, error);

    let errorDetail = `Erro ao ${operation} produto: ${error.message}`;

    if (error.message.includes('CORS')) {
      errorDetail = 'Erro de CORS. Verifique se a API permite requisições do frontend.';
    } else if (error.message.includes('400')) {
      errorDetail = 'Dados inválidos enviados para a API. Verifique os campos obrigatórios.';
    } else if (error.message.includes('401')) {
      errorDetail = 'Não autorizado. Faça login novamente.';
    } else if (error.message.includes('404')) {
      errorDetail = 'Endpoint não encontrado. Verifique a URL da API.';
    } else if (error.message.includes('500')) {
      errorDetail = 'Erro interno do servidor. Tente novamente.';
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: errorDetail,
      life: 5000
    });
  }

  onCancel() {
    console.log('🚫 Cancelando operação...');
    this.router.navigate(['/products']);
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Novo Produto' : `Editando Produto #${this.productId}`;
  }

  get submitButtonText(): string {
    return this.mode === 'create' ? 'Criar Produto' : 'Atualizar Produto';
  }

  get isFormValid(): boolean {
    return this.productForm.valid && !this.submitting;
  }

  // 👇 MÉTODO DE TESTE ATUALIZADO
  fillFormTest() {
    console.log('🧪 Preenchendo formulário automaticamente...');

    this.productForm.patchValue({
      name: 'Paracetamol 500mg',
      description: 'Analgésico e antitérmico para alívio de dores e febre',
      stock: 100,
      cost: 5.50,
      salePrice: 12.90,
      brandId: 2,
      categoryId: 1,
      status: 'active', // 👈 CAMPO OBRIGATÓRIO ADICIONADO
      createdByUser: 'admin',
      updatedByUser: 'admin'
    });

    console.log('✅ Formulário preenchido com dados de teste:', this.productForm.value);
    this.messageService.add({
      severity: 'success',
      summary: 'Teste',
      detail: 'Formulário preenchido automaticamente! Agora clique em "Criar Produto"',
      life: 3000
    });
  }
}
