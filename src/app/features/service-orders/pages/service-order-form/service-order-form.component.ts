import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ServiceOrderService } from '../../services/service-order.service';
import { Client } from '../../models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ProductOption, ServiceOption } from '../../../service-order-items/models/service-order-item.model';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/models/user.model';
import { PaymentMethodService } from '../../../payment-methods/services/payment-method.service';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';

interface Installment {
  number: number;
  value: number;
  paid: boolean;
}

@Component({
  selector: 'app-service-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CheckboxModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss']
})
export class ServiceOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private paymentMethodService = inject(PaymentMethodService);
  private userService = inject(UserService);
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
  paymentMethods = signal<PaymentMethod[]>([]);
  paymentMethodsLoading = signal(true);
  private isLoadingData = false;
  users = signal<User[]>([]);
  usersLoading = signal(true);
  installmentsList = signal<Installment[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadProducts();
    this.loadServices();
    this.loadPaymentMethods();
    this.loadUsers();
    this.checkEditMode();
  }

  private loadUsers(): void {
    this.usersLoading.set(true);
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users.set(response);
        this.usersLoading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.usersLoading.set(false);
      }
    });
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      clientId: [null],
      discount: [null, [Validators.min(0), Validators.max(100)]],
      total: [0, [Validators.required, Validators.min(0.01)]],
      notes: [''],
      paymentMethodId: [null, Validators.required],
      installments: [{ value: 1, disabled: true }],
      items: this.fb.array([this.createItemFormGroup()])
    });

    this.orderForm.get('discount')?.valueChanges.subscribe(() => this.calculateTotal());

    this.orderForm.get('paymentMethodId')?.valueChanges.subscribe(paymentMethodId => {
      this.onPaymentMethodChange(paymentMethodId);
    });
  }

  private createItemFormGroup(): FormGroup {
    const itemGroup = this.fb.group({
      productId: [null],
      serviceId: [null],
      responsibleUserId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });

    itemGroup.get('productId')?.valueChanges.subscribe(() => {
      if (itemGroup.get('productId')?.value) {
        itemGroup.patchValue({ responsibleUserId: null, serviceId: null });
      }
    });
    itemGroup.get('serviceId')?.valueChanges.subscribe(() => {
      if (itemGroup.get('serviceId')?.value) {
        itemGroup.patchValue({ productId: null });
      } else {
        itemGroup.patchValue({ responsibleUserId: null });
      }
    });

    itemGroup.get('quantity')?.valueChanges.subscribe(() => {
      if (!this.isLoadingData) {
        this.calculateTotal();
      }
    });
    itemGroup.get('unitPrice')?.valueChanges.subscribe(() => {
      if (!this.isLoadingData) {
        this.calculateTotal();
      }
    });

    return itemGroup;
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateTotal();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'A ordem deve ter pelo menos 1 item'
      });
    }
  }

  private calculateTotal(): void {
    const discountPercent = this.orderForm.get('discount')?.value || 0;

    let subtotal = 0;
    this.items.controls.forEach(item => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      subtotal += quantity * unitPrice;
    });

    const discountValue = subtotal * (discountPercent / 100);

    const total = subtotal - discountValue;

    this.orderForm.get('total')?.setValue(total, { emitEvent: false });
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

  private loadPaymentMethods(): void {
    this.paymentMethodsLoading.set(true);
    this.paymentMethodService.getAll().subscribe({
      next: (methods) => {
        this.paymentMethods.set(methods);
        this.paymentMethodsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar formas de pagamento'
        });
        this.paymentMethodsLoading.set(false);
      }
    });
  }

  onPaymentMethodChange(paymentMethodId: string | null): void {
    if (!paymentMethodId) {
      this.orderForm.get('installments')?.setValue(1);
      this.orderForm.get('installments')?.disable();
      return;
    }

    const selectedMethod = this.paymentMethods().find(pm => pm.id === paymentMethodId);

    if (selectedMethod) {
      const installments = selectedMethod.installments || 1;
      this.orderForm.get('installments')?.setValue(installments);
      this.orderForm.get('installments')?.disable();
    }
  }

  generateInstallments(): void {
    const total = this.orderForm.get('total')?.value || 0;
    const installments = this.orderForm.get('installments')?.value || 1;

    if (total <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O total deve ser maior que zero'
      });
      return;
    }

    if (installments <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O número de parcelas deve ser maior que zero'
      });
      return;
    }

    const installmentValue = total / installments;
    const newInstallments = Array.from({ length: installments }, (_, i) => ({
      number: i + 1,
      value: installmentValue,
      paid: false
    }));

    this.installmentsList.set(newInstallments);

    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: `${installments} parcela(s) gerada(s) com sucesso`
    });
  }

  onProductChange(productId: number, itemIndex: number): void {
    if (productId) {
      const itemControl = this.items.at(itemIndex);
      itemControl.patchValue({ serviceId: null });
      const product = this.products().find(p => p.id === productId);
      if (product) {
        itemControl.patchValue({ unitPrice: product.price });
      }
    }
  }

  onServiceChange(serviceId: number, itemIndex: number): void {
    if (serviceId) {
      const itemControl = this.items.at(itemIndex);
      itemControl.patchValue({ productId: null });
      const service = this.services().find(s => s.id === serviceId);
      if (service) {
        itemControl.patchValue({ unitPrice: service.price });
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
    this.isLoadingData = true;

    this.serviceOrderService.getById(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          clientId: order.clientId,
          discount: order.discount,
          total: order.total,
          notes: order.notes || ''
        });

        this.loadOrderItems(id);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar ordem de serviço'
        });
        this.loading.set(false);
        this.isLoadingData = false;
        this.router.navigate(['/service-orders']);
      }
    });
  }

  private loadOrderItems(serviceOrderId: number): void {
    this.serviceOrderItemService.getAll().subscribe({
      next: (response) => {
        const items = response.data.filter(item => item.serviceOrderId === serviceOrderId);

        while (this.items.length > 0) {
          this.items.removeAt(0);
        }

        if (items.length > 0) {
          items.forEach(item => {
            const itemGroup = this.createItemFormGroup();
            itemGroup.patchValue({
              productId: item.productId || null,
              serviceId: item.serviceId || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            });
            this.items.push(itemGroup);
          });
        } else {
          this.items.push(this.createItemFormGroup());
        }

        this.loading.set(false);
        this.isLoadingData = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar itens da ordem'
        });
        this.loading.set(false);
        this.isLoadingData = false;
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

    const serviceOrderPayload = {
      clientId: formValues.clientId || null,
      discount: formValues.discount || null,
      notes: formValues.notes || null
    };

    console.log('========== ETAPA 1: CRIAR ORDEM DE SERVIÇO ==========');
    console.log('Payload da ordem de serviço:', serviceOrderPayload);

    this.serviceOrderService.create(serviceOrderPayload as any).subscribe({
      next: (serviceOrderResponse) => {
        console.log('Ordem de serviço criada com sucesso:', serviceOrderResponse);
        console.log('ID da ordem criada:', serviceOrderResponse.id);

        this.orderId.set(serviceOrderResponse.id);

        const items = formValues.items || [];
        console.log('========== ETAPA 2: CRIAR ITENS DA ORDEM DE SERVIÇO ==========');
        console.log(`Total de itens para criar: ${items.length}`);

        let itemsCreated = 0;
        let itemsWithError = 0;

        items.forEach((item: any, index: number) => {
          let serviceOrderItemPayload: any = {
            serviceOrderId: serviceOrderResponse.id,
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          };
          if (item.serviceId) {
            serviceOrderItemPayload.responsibleUserId = item.responsibleUserId;
          } else {
            delete serviceOrderItemPayload.responsibleUserId;
          }

          if (item.productId) {
            delete serviceOrderItemPayload.responsibleUserId;
          }

          console.log(`Criando item ${index + 1}:`, serviceOrderItemPayload);

          this.serviceOrderItemService.create(serviceOrderItemPayload).subscribe({
            next: (itemResponse) => {
              itemsCreated++;
              console.log(`Item ${index + 1} criado com sucesso:`, itemResponse);

              if (itemsCreated + itemsWithError === items.length) {
                this.finishSubmit(itemsCreated, itemsWithError);
              }
            },
            error: (itemError) => {
              itemsWithError++;
              console.error(`Erro ao criar item ${index + 1}:`, itemError);

              if (itemsCreated + itemsWithError === items.length) {
                this.finishSubmit(itemsCreated, itemsWithError);
              }
            }
          });
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

  private finishSubmit(itemsCreated: number, itemsWithError: number): void {
    console.log('========== PROCESSO COMPLETO! ==========');
    console.log(`Itens criados: ${itemsCreated}, Erros: ${itemsWithError}`);

    this.finishWithMessage(itemsCreated, itemsWithError);
  }

  private finishWithMessage(itemsCreated: number, itemsWithError: number): void {
    this.loading.set(false);

    let detail = '';
    if (itemsWithError === 0) {
      detail = `Ordem de serviço e ${itemsCreated} item(ns) criados com sucesso!`;
    } else {
      detail = `Ordem criada. ${itemsCreated} item(ns) criado(s), ${itemsWithError} com erro.`;
    }

    this.messageService.add({
      severity: itemsWithError === 0 ? 'success' : 'warn',
      summary: itemsWithError === 0 ? 'Sucesso' : 'Aviso',
      detail: detail
    });

    setTimeout(() => {
      this.router.navigate(['/service-orders']);
    }, 1500);
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
