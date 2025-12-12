// src/app/features/services/pages/service-form/service-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ServiceService } from '../../services/service.service';
import { ServiceFormData, ServiceCategory } from '../../models/service.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CheckboxModule,
    SuccessModalComponent
  ],
  providers: [MessageService],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  serviceForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  serviceId = signal<string | null>(null);
  categories = signal<ServiceCategory[]>([]);
  categoriesLoading = signal(true);

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      active: [true]
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.serviceService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
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
    this.serviceService.getById(id).subscribe({
      next: (service) => {
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          price: service.price,
          categoryId: service.categoryId,
          active: service.active
        });
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
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const formData: ServiceFormData = this.serviceForm.value;

    const operation = this.isEditMode()
      ? this.serviceService.update(this.serviceId()!, formData)
      : this.serviceService.create(formData);

    operation.subscribe({
      next: () => {
        this.successModalService.show(
          this.isEditMode()
            ? 'Serviço atualizado com sucesso!'
            : 'Serviço criado com sucesso!'
        );

        setTimeout(() => {
          this.router.navigate(['/services']);
        }, 2500);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar serviço'
        });
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/services']);
  }

  private markFormGroupTouched(): void {
    Object.values(this.serviceForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
