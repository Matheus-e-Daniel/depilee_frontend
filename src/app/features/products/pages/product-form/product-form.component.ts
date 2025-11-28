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
  statusOptions = PRODUCT_STATUS;

  // Para calcular margem de lucro em tempo real
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
    this.determineMode();
  }

  ngOnDestroy() {}

  determineMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.mode = 'edit';
      this.productId = +id;
      this.loadProduct();
    } else {
      this.mode = 'create';
      console.log('📝 Modo: Criação de novo produto');
    }
  }

  createForm(): FormGroup {
    console.log('🔄 Criando FormGroup...');

    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      brandId: [null],
      categoryId: [null],
      status: ['active', Validators.required]
    });
  }

  // 👇 Ouvir mudanças para calcular margem de lucro
  setupFormListeners() {
    this.productForm.get('cost')?.valueChanges.subscribe(() => this.calculateProfit());
    this.productForm.get('salePrice')?.valueChanges.subscribe(() => this.calculateProfit());
  }

  calculateProfit() {
    const cost = this.productForm.get('cost')?.value || 0;
    const salePrice = this.productForm.get('salePrice')?.value || 0;
    this.profitMargin = calculateProfitMargin(cost, salePrice);
  }

  loadProduct() {
    if (!this.productId) return;

    this.loading = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        console.log('📦 Produto carregado:', product);
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          stock: product.stock,
          cost: product.cost,
          salePrice: product.salePrice,
          brandId: product.brandId,
          categoryId: product.categoryId,
          status: product.status
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar produto'
        });
        this.loading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit() {
    console.log('🟡 BOTÃO CLICADO - Iniciando onSubmit...');

    // 👇 DEBUG: Verificar estado do formulário
    console.log('📋 ESTADO DO FORMULÁRIO:');
    console.log('- Válido:', this.productForm.valid);
    console.log('- Sujo:', this.productForm.dirty);
    console.log('- Touched:', this.productForm.touched);

    // 👇 DEBUG: Verificar cada campo individualmente
    console.log('🔍 VALIDAÇÃO DOS CAMPOS:');
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      console.log(`- ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched
      });
    });

    if (this.productForm.invalid) {
      console.log('❌ FORMULÁRIO INVÁLIDO - Marcando campos como touched...');
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

    // 👇 LOGS DETALHADOS
    console.log('🎯 DADOS DO FORMULÁRIO QUE SERÃO ENVIADOS:');
    console.log('=========================================');
    console.log(`🔧 Modo: ${this.mode.toUpperCase()}`);
    console.log(`🆔 ID: ${this.mode === 'edit' ? this.productId : 'NOVO'}`);
    console.log('-----------------------------------------');
    console.log(`📛 Nome: ${formData.name}`);
    console.log(`📝 Descrição: ${formData.description || '(Não informada)'}`);
    console.log(`📦 Estoque: ${formData.stock} unidades`);
    console.log(`💰 Custo: R$ ${formData.cost}`);
    console.log(`🏷️ Preço de Venda: R$ ${formData.salePrice}`);
    console.log(`📊 Margem de Lucro: ${this.profitMargin.toFixed(2)}%`);
    console.log(`🏭 Marca ID: ${formData.brandId || 'Não informada'}`);
    console.log(`📁 Categoria ID: ${formData.categoryId || 'Não informada'}`);
    console.log(`📈 Status: ${formData.status}`);
    console.log('-----------------------------------------');
    console.log('📋 Dados completos (JSON):', JSON.stringify(formData, null, 2));
    console.log('=========================================\n');

    if (this.mode === 'create') {
      console.log('🚀 INICIANDO CRIAÇÃO DE PRODUTO...');
      this.createProduct(formData);
    } else {
      console.log('✏️ INICIANDO EDIÇÃO DE PRODUTO...');
      this.updateProduct(formData);
    }
  }

  createProduct(formData: ProductFormData) {
    this.productsService.createProduct(formData).subscribe({
      next: (product) => {
        console.log('✅ PRODUTO CRIADO COM SUCESSO:', product);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto criado com sucesso!'
        });

        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao criar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar produto'
        });
        this.submitting = false;
      },
      complete: () => {
        console.log('✅ createProduct completado');
        this.submitting = false;
      }
    });
  }

  updateProduct(formData: ProductFormData) {
    if (!this.productId) return;

    this.productsService.updateProduct(this.productId, formData).subscribe({
      next: (product) => {
        console.log('✅ PRODUTO ATUALIZADO COM SUCESSO:', product);

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto atualizado com sucesso!'
        });

        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar produto'
        });
        this.submitting = false;
      },
      complete: () => {
        console.log('✅ updateProduct completado');
        this.submitting = false;
      }
    });
  }

  onCancel() {
    console.log('🚪 Cancelando e voltando para lista...');
    this.router.navigate(['/products']);
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar o template
  get title(): string {
    return this.mode === 'create' ? 'Novo Produto' : `Editando Produto #${this.productId}`;
  }

  get submitButtonText(): string {
    return this.mode === 'create' ? 'Criar Produto' : 'Atualizar Produto';
  }

  get isFormValid(): boolean {
    return this.productForm.valid && !this.submitting;
  }

  // 👇 MÉTODO DE TESTE TEMPORÁRIO - REMOVA DEPOIS
  fillFormTest() {
    console.log('🧪 Preenchendo formulário automaticamente...');

    this.productForm.patchValue({
      name: 'Paracetamol 500mg',
      description: 'Analgésico e antitérmico para alívio de dores e febre',
      stock: 100,
      cost: 5.50,
      salePrice: 12.90,
      brandId: 2, // Pfizer
      categoryId: 1, // Medicamento
      status: 'active'
    });

    console.log('✅ Formulário preenchido com dados de teste');
    this.messageService.add({
      severity: 'success',
      summary: 'Teste',
      detail: 'Formulário preenchido automaticamente! Agora clique em "Criar Produto"',
      life: 3000
    });
  }
}
