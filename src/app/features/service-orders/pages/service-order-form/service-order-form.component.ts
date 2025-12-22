// src/app/features/service-orders/pages/service-order-form/service-order-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceOrderService } from '../../services/service-order.service';
import { Client } from '../../models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ProductOption, ServiceOption } from '../../../service-order-items/models/service-order-item.model';

@Component({
  selector: 'app-service-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss']
})
export class ServiceOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  orderForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  orderId = signal<number | null>(null);
  clients = signal<Client[]>([]);
  clientsLoading = signal(true);
  products = signal<ProductOption[]>([]);
  services = signal<ServiceOption[]>([]);
  productsLoading = signal(true);
  servicesLoading = signal(true);

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadProducts();
    this.loadServices();
    this.checkEditMode();
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      clientId: [null],
      discount: [null, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0.01)]],
      notes: [''],
      productId: [null],
      serviceId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private loadClients(): void {
    this.clientsLoading.set(true);
    this.serviceOrderService.getClients().subscribe({
      next: (response) => {
        this.clients.set(response.data);
        this.clientsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar clientes'
        });
        this.clientsLoading.set(false);
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
      this.orderForm.patchValue({ serviceId: null });
      const product = this.products().find(p => p.id === productId);
      if (product) {
        this.orderForm.patchValue({ unitPrice: product.salePrice });
      }
    }
  }

  onServiceChange(serviceId: number): void {
    if (serviceId) {
      this.orderForm.patchValue({ productId: null });
      const service = this.services().find(s => s.id === serviceId);
      if (service) {
        this.orderForm.patchValue({ unitPrice: service.price });
      }
    }
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.orderId.set(Number(id));
      this.loadOrder(Number(id));
    }
  }

  private loadOrder(id: number): void {
    this.loading.set(true);
    this.serviceOrderService.getById(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          clientId: order.clientId,
          discount: order.discount,
          total: order.total,
          notes: order.notes || ''
        });

        // Carregar os itens da ordem de serviço
        this.loadOrderItems(id);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar ordem de serviço'
        });
        this.loading.set(false);
        this.router.navigate(['/service-orders']);
      }
    });
  }

  private loadOrderItems(serviceOrderId: number): void {
    this.serviceOrderItemService.getAll().subscribe({
      next: (response) => {
        // Filtrar apenas os itens desta ordem de serviço
        const items = response.data.filter(item => item.serviceOrderId === serviceOrderId);

        if (items.length > 0) {
          // Preencher com o primeiro item (assumindo 1 item por ordem neste fluxo)
          const firstItem = items[0];
          this.orderForm.patchValue({
            productId: firstItem.productId || null,
            serviceId: firstItem.serviceId || null,
            quantity: firstItem.quantity,
            unitPrice: firstItem.unitPrice
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar itens da ordem'
        });
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const formValues = this.orderForm.value;

    // ETAPA 1: Criar a ordem de serviço
    const serviceOrderPayload = {
      clientId: formValues.clientId || null,
      discount: formValues.discount || null,
      total: formValues.total,
      notes: formValues.notes || null
    };

    console.log('========== ETAPA 1: CRIAR ORDEM DE SERVIÇO ==========');
    console.log('Payload da ordem de serviço:', serviceOrderPayload);

    this.serviceOrderService.create(serviceOrderPayload as any).subscribe({
      next: (serviceOrderResponse) => {
        console.log('Ordem de serviço criada com sucesso:', serviceOrderResponse);
        console.log('ID da ordem criada:', serviceOrderResponse.id);

        // ETAPA 2: Criar o item da ordem de serviço
        const serviceOrderItemPayload = {
          serviceOrderId: serviceOrderResponse.id,
          productId: formValues.productId || null,
          serviceId: formValues.serviceId || null,
          quantity: formValues.quantity,
          unitPrice: formValues.unitPrice
        };

        console.log('========== ETAPA 2: CRIAR ITEM DA ORDEM DE SERVIÇO ==========');
        console.log('Payload do item:', serviceOrderItemPayload);

        this.serviceOrderItemService.create(serviceOrderItemPayload).subscribe({
          next: (itemResponse) => {
            console.log('Item da ordem de serviço criado com sucesso:', itemResponse);
            console.log('========== PROCESSO COMPLETO! ==========');

            this.loading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Ordem de serviço e item criados com sucesso!'
            });

            setTimeout(() => {
              this.router.navigate(['/service-orders']);
            }, 1500);
          },
          error: (itemError) => {
            console.error('========== ERRO AO CRIAR ITEM ==========');
            console.error('Erro:', itemError);
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Ordem criada, mas falha ao criar item'
            });
          }
        });
      },
      error: (error) => {
        console.error('========== ERRO AO CRIAR ORDEM DE SERVIÇO ==========');
        console.error('Erro:', error);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar ordem de serviço'
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/service-orders']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
    });
  }
}
