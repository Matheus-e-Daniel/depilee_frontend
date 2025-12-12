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
      stock: [0, [Validators.required, Validators.min(0)]],
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
}
