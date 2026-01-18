// src/app/features/categories/pages/category-form/category-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryService } from '../../services/category.service';
import { CategoryFormData } from '../../models/category.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TooltipModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);


  categoryForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  categoryId = signal<string | null>(null);
  formSubmitted = signal(false);
  formModified = signal(false);
  originalFormValue: any = null;

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    // Track form modifications
    this.categoryForm.valueChanges.subscribe(() => {
      if (this.isEditMode() && this.originalFormValue) {
        this.checkFormModified();
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.categoryId.set(id);
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.loading.set(true);
    this.categoryService.getById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description
        });
        // Store original values for comparison
        this.originalFormValue = JSON.stringify(this.categoryForm.value);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar categoria'
        });
        this.router.navigate(['/categories']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.categoryForm.invalid) {
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: CategoryFormData = this.categoryForm.value;

    const payload = this.isEditMode()
      ? { id: this.categoryId(), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.categoryService.update(payload)
      : this.categoryService.create(payload);

    operation.subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Categoria atualizada com sucesso!'
            : 'Categoria criada com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/categories']);
        }, 2500);
      },
      error: () => {
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar categoria'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }

  private checkFormModified(): void {
    const currentValue = JSON.stringify(this.categoryForm.value);
    this.formModified.set(currentValue !== this.originalFormValue);
  }
}

