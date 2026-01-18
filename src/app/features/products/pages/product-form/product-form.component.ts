// src/app/features/products/pages/product-form/product-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ProductService } from '../../services/product.service';
import { ProductFormData } from '../../models/product.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { BrandService } from '../../../brands/services/brand.service';
import { CategoryService } from '../../../categories/services/category.service';
import { Brand } from '../../../brands/models/brand.model';
import { Category } from '../../../categories/models/category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    ToastModule,
    DropdownModule,
    CheckboxModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  productForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  // Data from API
  brands = signal<Brand[]>([]);
  categories = signal<Category[]>([]);
  brandsLoading = signal(true);
  categoriesLoading = signal(true);

  ngOnInit(): void {
    this.initForm();
    this.loadBrands();
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      cost: ['', [Validators.required, Validators.min(0.01)]],
      salePrice: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brandId: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  private loadBrands(): void {
    this.brandsLoading.set(true);
    this.brandService.getAll().subscribe({
      next: (response) => {
        this.brands.set(response.data);
        this.brandsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar marcas'
        });
        this.brandsLoading.set(false);
      }
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.categoriesLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar categorias'
        });
        this.categoriesLoading.set(false);
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          cost: product.cost,
          salePrice: product.salePrice,
          stock: product.stock,
          brandId: product.brandId,
          categoryId: product.categoryId
        });

        // Formata os valores nos inputs
        setTimeout(() => {
          const costInput = document.getElementById('cost') as HTMLInputElement;
          const salePriceInput = document.getElementById('salePrice') as HTMLInputElement;
          const stockInput = document.getElementById('stock') as HTMLInputElement;

          if (costInput && product.cost) {
            costInput.value = product.cost.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 2
            });
          }

          if (salePriceInput && product.salePrice) {
            salePriceInput.value = product.salePrice.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 2
            });
          }

          if (stockInput && product.stock !== undefined) {
            stockInput.value = product.stock.toLocaleString('pt-BR');
          }
        }, 0);

        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar produto'
        });
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: ProductFormData = this.productForm.value;

    const payload = this.isEditMode()
      ? { id: this.productId(), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.productService.update(payload)
      : this.productService.create(payload);

    operation.subscribe({
      next: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Produto atualizado com sucesso!'
            : 'Produto criado com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/products']);
        }, 2500);
      },
      error: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar produto'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }


  onCancel(): void {
    this.router.navigate(['/products']);
  }

  private markFormGroupTouched(): void {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  onCurrencyFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value.trim() === '') {
      input.value = 'R$ ';
      // Posiciona o cursor após o R$
      setTimeout(() => {
        input.setSelectionRange(3, 3);
      }, 0);
    }
  }

  onCurrencyInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Se o usuário apagar o "R$ ", recoloca
    if (!value.startsWith('R$ ')) {
      // Remove qualquer R$ ou espaço solto
      value = value.replace(/R\$?\s*/g, '');
      input.value = 'R$ ' + value;
      // Reposiciona o cursor
      const cursorPos = input.value.length;
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  formatCurrencyOnBlur(event: any, fieldName: string): void {
    let value = event.target.value;

    // Remove o "R$ " para processar
    value = value.replace(/R\$\s*/g, '');

    // Remove tudo exceto números, vírgula e ponto
    value = value.replace(/[^\d.,]/g, '');

    // Se não houver valor, limpa o campo
    if (!value) {
      this.productForm.get(fieldName)?.setValue('', { emitEvent: false });
      event.target.value = '';
      return;
    }

    // Substitui vírgula por ponto para conversão
    const normalizedValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(normalizedValue);

    // Se não for um número válido, limpa
    if (isNaN(numericValue)) {
      this.productForm.get(fieldName)?.setValue('', { emitEvent: false });
      event.target.value = '';
      return;
    }

    // Formata como moeda brasileira
    const formatted = numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });

    // Atualiza o valor visual
    event.target.value = formatted;

    // Atualiza o valor do formulário com o número
    this.productForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });
  }

  formatNumberOnBlur(event: any, fieldName: string): void {
    let value = event.target.value;

    // Remove tudo exceto números
    value = value.replace(/\D/g, '');

    // Se não houver valor, define como 0 no formulário mas deixa o campo vazio
    if (!value) {
      this.productForm.get(fieldName)?.setValue(0, { emitEvent: false });
      event.target.value = '';
      return;
    }

    const numericValue = parseInt(value);

    // Se não for um número válido, define como 0 no formulário mas deixa o campo vazio
    if (isNaN(numericValue)) {
      this.productForm.get(fieldName)?.setValue(0, { emitEvent: false });
      event.target.value = '';
      return;
    }

    // Formata com separador de milhar
    const formatted = numericValue.toLocaleString('pt-BR');

    // Atualiza o valor visual
    event.target.value = formatted;

    // Atualiza o valor do formulário com o número
    this.productForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });
  }
}
