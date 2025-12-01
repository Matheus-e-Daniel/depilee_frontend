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
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  productForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  // Lista de marcas (pode vir de um serviço depois)
  brands = [
    { id: 1, name: 'Nike' },
    { id: 2, name: 'Adidas' },
    { id: 3, name: 'Apple' },
    { id: 4, name: 'Samsung' },
    { id: 5, name: 'Sony' }
  ];

  // Lista de categorias atualizada para usar id
  categories = [
    { id: 1, name: 'Eletrônicos' },
    { id: 2, name: 'Vestuário' },
    { id: 3, name: 'Alimentação' },
    { id: 4, name: 'Livros' },
    { id: 5, name: 'Esportes' },
    { id: 6, name: 'Casa e Jardim' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      salePrice: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      brandId: ['', Validators.required],
      categoryId: ['', Validators.required]
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

    this.loading.set(true);
    const formData: ProductFormData = this.productForm.value;

    const operation = this.isEditMode()
      ? this.productService.update(this.productId()!, formData)
      : this.productService.create(formData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode()
            ? 'Produto atualizado com sucesso!'
            : 'Produto criado com sucesso!'
        });

        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar produto'
        });
        this.loading.set(false);
      }
    });
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
