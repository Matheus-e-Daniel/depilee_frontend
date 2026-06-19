import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
    DropdownModule,
    CheckboxModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  productForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  formSubmitted = signal(false);
  originalFormValue: any = null;
  formModified = signal(false);

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

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
      cost: [0],
      salePrice: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brandId: ['', Validators.required],
      categoryId: ['', Validators.required]
    });

    this.productForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.checkFormModified();
    });
  }

  private loadBrands(): void {
    this.brandsLoading.set(true);
    this.brandService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.brands.set(response.data);
        this.brandsLoading.set(false);
      },
      error: () => {
        this.brandsLoading.set(false);
      }
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.categoriesLoading.set(false);
      },
      error: () => {
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
    this.productService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          cost: 0,
          salePrice: product.price,
          stock: product.stock,
          brandId: product.brandId,
          categoryId: product.categoryId
        });

        setTimeout(() => {
          const salePriceInput = document.getElementById('salePrice') as HTMLInputElement;
          const stockInput = document.getElementById('stock') as HTMLInputElement;

          if (salePriceInput && product.price) {
            salePriceInput.value = product.price.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 2
            });
          }

          if (stockInput && product.stock !== undefined) {
            stockInput.value = product.stock.toLocaleString('pt-BR');
          }
        }, 0);

        this.originalFormValue = JSON.parse(JSON.stringify(this.productForm.value));
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: ProductFormData = { ...this.productForm.value, cost: 0 };

    const payload = this.isEditMode()
      ? { id: this.productId(), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.productService.update(payload)
      : this.productService.create(payload);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

  private checkFormModified(): void {
    if (!this.isEditMode() || !this.originalFormValue) {
      return;
    }

    const currentValue = this.productForm.value;
    const isModified = JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
    this.formModified.set(isModified);
  }

  onCurrencyFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value.trim() === '') {
      input.value = 'R$ ';
      setTimeout(() => {
        input.setSelectionRange(3, 3);
      }, 0);
    }
  }

  onCurrencyInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (!value.startsWith('R$ ')) {
      value = value.replace(/R\$?\s*/g, '');
      input.value = 'R$ ' + value;
      const cursorPos = input.value.length;
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  formatCurrencyOnBlur(event: any, fieldName: string): void {
    let value = event.target.value;

    value = value.replace(/R\$\s*/g, '');

    value = value.replace(/[^\d.,]/g, '');

    if (!value) {
      this.productForm.get(fieldName)?.setValue('', { emitEvent: false });
      event.target.value = '';
      return;
    }

    const normalizedValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(normalizedValue);

    if (isNaN(numericValue)) {
      this.productForm.get(fieldName)?.setValue('', { emitEvent: false });
      event.target.value = '';
      return;
    }

    const formatted = numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });

    event.target.value = formatted;

    this.productForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });
  }

  formatNumberOnBlur(event: any, fieldName: string): void {
    let value = event.target.value;

    value = value.replace(/\D/g, '');

    if (!value) {
      this.productForm.get(fieldName)?.setValue(0, { emitEvent: false });
      event.target.value = '';
      return;
    }

    const numericValue = parseInt(value);

    if (isNaN(numericValue)) {
      this.productForm.get(fieldName)?.setValue(0, { emitEvent: false });
      event.target.value = '';
      return;
    }

    const formatted = numericValue.toLocaleString('pt-BR');

    event.target.value = formatted;

    this.productForm.get(fieldName)?.setValue(numericValue, { emitEvent: false });
  }
}
