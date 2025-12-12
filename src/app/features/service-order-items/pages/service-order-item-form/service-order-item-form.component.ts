// src/app/features/service-order-items/pages/service-order-item-form/service-order-item-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceOrderItemService } from '../../services/service-order-item.service';
import { ServiceOrderItemFormData, ServiceOrder, ProductOption, ServiceOption } from '../../models/service-order-item.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-service-order-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './service-order-item-form.component.html',
  styleUrls: ['./service-order-item-form.component.scss']
})
export class ServiceOrderItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  itemForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  itemId = signal<number | null>(null);
  serviceOrders = signal<ServiceOrder[]>([]);
  products = signal<ProductOption[]>([]);
  services = signal<ServiceOption[]>([]);
  serviceOrdersLoading = signal(true);
  productsLoading = signal(true);
  servicesLoading = signal(true);

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadServiceOrders();
    this.loadProducts();
    this.loadServices();
    this.checkEditMode();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      serviceOrderId: ['', Validators.required],
      productId: [''],
      serviceId: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    }, { validators: this.productOrServiceRequired });
  }

  private productOrServiceRequired(group: FormGroup) {
    const productId = group.get('productId')?.value;
    const serviceId = group.get('serviceId')?.value;
    return productId || serviceId ? null : { productOrServiceRequired: true };
  }

  private loadServiceOrders(): void {
    this.serviceOrdersLoading.set(true);
    this.serviceOrderItemService.getServiceOrders().subscribe({
      next: (response) => {
        this.serviceOrders.set(response.data);
        this.serviceOrdersLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar ordens de serviço'
        });
        this.serviceOrdersLoading.set(false);
      }
    });
  }

  private loadProducts(): void {
    this.productsLoading.set(true);
    this.serviceOrderItemService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.productsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar produtos'
        });
        this.productsLoading.set(false);
      }
    });
  }

  private loadServices(): void {
    this.servicesLoading.set(true);
    this.serviceOrderItemService.getServices().subscribe({
      next: (response) => {
        this.services.set(response.data);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar serviços'
        });
        this.servicesLoading.set(false);
      }
    });
  }

  onProductChange(productId: number): void {
    if (productId) {
      this.itemForm.patchValue({ serviceId: null });
      const product = this.products().find(p => p.id === productId);
      if (product) {
        this.itemForm.patchValue({ unitPrice: product.salePrice });
      }
    }
  }

  onServiceChange(serviceId: number): void {
    if (serviceId) {
      this.itemForm.patchValue({ productId: null });
      const service = this.services().find(s => s.id === serviceId);
      if (service) {
        this.itemForm.patchValue({ unitPrice: service.price });
      }
    }
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(Number(id));
      this.loadItem(Number(id));
    }
  }

  private loadItem(id: number): void {
    this.loading.set(true);
    this.serviceOrderItemService.getById(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          serviceOrderId: item.serviceOrderId,
          productId: item.productId || null,
          serviceId: item.serviceId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar item'
        });
        this.router.navigate(['/service-order-items']);
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: ServiceOrderItemFormData = this.itemForm.value;

    const payload = this.isEditMode()
      ? { id: this.itemId()!, ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.serviceOrderItemService.update(payload)
      : this.serviceOrderItemService.create(formData);

    operation.subscribe({
      next: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Item atualizado com sucesso!'
            : 'Item criado com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/service-order-items']);
        }, 2500);
      },
      error: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar ordem de serviço'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/service-order-items']);
  }

  private markFormGroupTouched(): void {
    Object.values(this.itemForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
