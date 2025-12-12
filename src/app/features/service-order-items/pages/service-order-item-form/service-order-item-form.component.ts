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

@Component({
  selector: 'app-service-order-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SuccessModalComponent
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
  itemId = signal<string | null>(null);
  serviceOrders = signal<ServiceOrder[]>([]);
  products = signal<ProductOption[]>([]);
  services = signal<ServiceOption[]>([]);
  serviceOrdersLoading = signal(true);
  productsLoading = signal(true);
  servicesLoading = signal(true);

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
    });


  }

  private productOrServiceRequired(form: FormGroup) {
    const productId = form.get('productId')?.value;
    const serviceId = form.get('serviceId')?.value;

    if (!productId && !serviceId) {
      return { productOrServiceRequired: true };
    }
    return null;
  }

  private loadServiceOrders(): void {
    this.serviceOrdersLoading.set(true);
    this.serviceOrderItemService.getServiceOrders().subscribe({
      next: (orders) => {
        this.serviceOrders.set(orders);
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
      next: (products) => {
        this.products.set(products);
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
      next: (services) => {
        this.services.set(services);
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

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      this.loadItem(id);
    }
  }

  private loadItem(id: string): void {
    this.loading.set(true);
    this.serviceOrderItemService.getById(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          serviceOrderId: item.serviceOrderId,
          productId: item.productId,
          serviceId: item.serviceId,
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

  onProductChange(productId: string): void {
    if (productId) {
      // Se selecionou produto, limpa serviço
      this.itemForm.patchValue({ serviceId: '' });
      // Atualiza preço unitário se produto tiver preço definido
      const product = this.products().find(p => p.id === productId);
      if (product?.price) {
        this.itemForm.patchValue({ unitPrice: product.price });
      }
    }
  }

  onServiceChange(serviceId: string): void {
    if (serviceId) {
      // Se selecionou serviço, limpa produto
      this.itemForm.patchValue({ productId: '' });
      // Atualiza preço unitário se serviço tiver preço definido
      const service = this.services().find(s => s.id === serviceId);
      if (service?.price) {
        this.itemForm.patchValue({ unitPrice: service.price });
      }
    }
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const formData: ServiceOrderItemFormData = this.itemForm.value;

    // Remove campos vazios
    if (!formData.productId) delete formData.productId;
    if (!formData.serviceId) delete formData.serviceId;

    const operation = this.isEditMode()
      ? this.serviceOrderItemService.update(this.itemId()!, formData)
      : this.serviceOrderItemService.create(formData);

    operation.subscribe({
      next: () => {
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar item'
        });
        this.loading.set(false);
      }
    });
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
