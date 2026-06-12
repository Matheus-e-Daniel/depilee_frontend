import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ServiceService } from '../../services/service.service';
import { ServiceFormData } from '../../models/service.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { CategoryService } from '../../../categories/services/category.service';
import { Category } from '../../../categories/models/category.model';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CheckboxModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  serviceForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  serviceId = signal<string | null>(null);
  categories = signal<Category[]>([]);
  categoriesLoading = signal(true);
  formSubmitted = signal(false);
  formModified = signal(false);
  originalFormValue: any = null;

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: ['', [Validators.required]],
      categoryId: ['', Validators.required],
      active: [true]
    });

    this.serviceForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isEditMode() && this.originalFormValue) {
        this.checkFormModified();
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
      this.serviceId.set(id);
      this.loadService(id);
    }
  }

  private loadService(id: string): void {
    this.loading.set(true);
    this.serviceService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (service) => {
        const formattedPrice = service.price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2
        });

        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          price: formattedPrice,
          categoryId: service.categoryId,
          active: service.active
        });

        this.originalFormValue = JSON.stringify(this.serviceForm.value);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar serviço'
        });
        this.router.navigate(['/services']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.serviceForm.invalid) {
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formValue = this.serviceForm.value;

    const priceValue = this.parseCurrency(formValue.price);

    const formData: ServiceFormData = {
      ...formValue,
      price: priceValue
    };

    const payload = this.isEditMode()
      ? { id: parseInt(this.serviceId()!), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.serviceService.update(payload)
      : this.serviceService.create(formData);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Serviço atualizado com sucesso!'
            : 'Serviço criado com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/services']);
        }, 2500);
      },
      error: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar serviço'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/services']);
  }

  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (!input.value || input.value.trim() === '') {
      input.value = 'R$ ';
    }
  }

  onCurrencyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value.startsWith('R$ ')) {
      input.value = 'R$ ' + input.value.replace(/^R\$\s*/, '');
    }
  }

  formatCurrencyOnBlur(event: FocusEvent, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/R\$\s*/g, '').trim();

    if (!value || value === '') {
      this.serviceForm.get(controlName)?.setValue('');
      return;
    }

    value = value.replace(/\./g, '').replace(',', '.');

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      const formatted = numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      });
      this.serviceForm.get(controlName)?.setValue(formatted);
    }
  }

  private parseCurrency(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  private checkFormModified(): void {
    const currentValue = JSON.stringify(this.serviceForm.value);
    this.formModified.set(currentValue !== this.originalFormValue);
  }
}
