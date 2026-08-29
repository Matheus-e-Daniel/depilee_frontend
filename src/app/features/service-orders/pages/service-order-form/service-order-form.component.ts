import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, Observable } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { ServiceOrderService } from '../../services/service-order.service';
import { ClientOption, ServiceOrder, OrderStatus } from '../../models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ProductOption, ServiceOption, ServiceOrderItem } from '../../../service-order-items/models/service-order-item.model';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/models/user.model';
import { PaymentMethodService } from '../../../payment-methods/services/payment-method.service';
import { PaymentMethod } from '../../../payment-methods/models/payment-method.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { ServiceOrderPaymentService } from '../../components/service-order-payment/service-order-payment.service';
import { Payment, PaymentInstallment, PaymentStatus } from '../../components/service-order-payment/payment.model';
import { CashRegisterService } from '../../../cash-registers/services/cash-register.service';
import { CashRegister } from '../../../cash-registers/models/cash-register.model';

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
    TagModule,
    TooltipModule,
    TabViewModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss']
})
export class ServiceOrderFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private paymentMethodService = inject(PaymentMethodService);
  private serviceOrderPaymentService = inject(ServiceOrderPaymentService);
  private cashRegisterService = inject(CashRegisterService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  orderForm!: FormGroup;
  serviceItemForm!: FormGroup;
  productItemForm!: FormGroup;

  loading = signal(false);
  isEditMode = signal(false);
  orderId = signal<number | null>(null);
  activeTabIndex = signal(0);

  creatingOrder = signal(false);
  savingInfo = signal(false);
  addingServiceItem = signal(false);
  addingProductItem = signal(false);
  removingItemId = signal<number | null>(null);
  cancelling = signal(false);
  showCancelConfirmation = signal(false);
  orderStatus = signal<OrderStatus | null>(null);
  readonly OrderStatus = OrderStatus;
  readonly PaymentStatus = PaymentStatus;

  canCancelOrder = computed(() => {
    const status = this.orderStatus();
    return status === OrderStatus.Draft || status === OrderStatus.Open;
  });

  clients = signal<ClientOption[]>([]);
  clientsLoading = signal(true);
  products = signal<ProductOption[]>([]);
  services = signal<ServiceOption[]>([]);
  productsLoading = signal(true);
  servicesLoading = signal(true);
  paymentMethods = signal<PaymentMethod[]>([]);
  paymentMethodsLoading = signal(true);
  users = signal<User[]>([]);
  usersLoading = signal(true);
  openCashRegister = signal<CashRegister | null>(null);
  cashRegisterLoading = signal(true);
  payment = signal<Payment | null>(null);
  creatingPayment = signal(false);
  payingInstallmentId = signal<number | null>(null);

  orderItems = signal<ServiceOrderItem[]>([]);
  serviceLineItems = computed(() => {
    const serviceIds = new Set(this.services().map(s => s.id));
    return this.orderItems().filter(item => serviceIds.has(item.itemId));
  });
  productLineItems = computed(() => {
    const productIds = new Set(this.products().map(p => p.id));
    return this.orderItems().filter(item => productIds.has(item.itemId));
  });

  private discountValue = signal<number | null>(null);
  subtotal = computed(() => this.orderItems().reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  total = computed(() => {
    const discountPercent = this.discountValue() || 0;
    const sub = this.subtotal();
    return sub - (sub * discountPercent / 100);
  });

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadProducts();
    this.loadServices();
    this.loadPaymentMethods();
    this.loadUsers();
    this.loadOpenCashRegister();
    this.checkEditMode();
  }

  private loadOpenCashRegister(): void {
    this.cashRegisterLoading.set(true);
    this.cashRegisterService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.openCashRegister.set(response.data.find(c => c.cashRegisterStatus === 1) ?? null);
        this.cashRegisterLoading.set(false);
      },
      error: () => {
        this.openCashRegister.set(null);
        this.cashRegisterLoading.set(false);
      }
    });
  }

  private loadPayment(serviceOrderId: number): void {
    this.serviceOrderPaymentService.getByServiceOrder(serviceOrderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const activePayment = response.data.find(p => p.paymentStatus !== PaymentStatus.Cancelled) ?? null;
        this.payment.set(activePayment);
        if (activePayment) {
          this.orderForm.get('paymentMethodId')?.setValue(activePayment.paymentMethodId, { emitEvent: false });
        }
      }
    });
  }

  private loadUsers(): void {
    this.usersLoading.set(true);
    this.userService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.users.set(response.data);
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
      notes: [''],
      paymentMethodId: [null],
      installments: [{ value: 1, disabled: true }]
    });

    this.serviceItemForm = this.fb.group({
      serviceId: [null, Validators.required],
      responsibleUserId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.productItemForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.orderForm.get('discount')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.discountValue.set(value);
    });

    this.orderForm.get('discount')?.valueChanges.pipe(
      debounceTime(600),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.syncOrderTotals();
    });

    this.orderForm.get('paymentMethodId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(paymentMethodId => {
      this.onPaymentMethodChange(paymentMethodId);
    });
  }

  private loadClients(): void {
    this.clientsLoading.set(true);
    this.serviceOrderService.getClients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.clients.set(response.data);
        this.clientsLoading.set(false);
      },
      error: () => {
        this.clientsLoading.set(false);
      }
    });
  }

  private loadProducts(): void {
    this.productsLoading.set(true);
    this.serviceOrderItemService.getProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.productsLoading.set(false);
      },
      error: () => {
        this.productsLoading.set(false);
      }
    });
  }

  private loadServices(): void {
    this.servicesLoading.set(true);
    this.serviceOrderItemService.getServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.services.set(response.data);
        this.servicesLoading.set(false);
      },
      error: () => {
        this.servicesLoading.set(false);
      }
    });
  }

  private loadPaymentMethods(): void {
    this.paymentMethodsLoading.set(true);
    this.paymentMethodService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.paymentMethods.set(response.data);
        this.paymentMethodsLoading.set(false);
      },
      error: () => {
        this.paymentMethodsLoading.set(false);
      }
    });
  }

  onPaymentMethodChange(paymentMethodId: number | null): void {
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

  createPayment(): void {
    const orderId = this.orderId();
    const paymentMethodId = this.orderForm.get('paymentMethodId')?.value;

    if (!orderId || !paymentMethodId) {
      return;
    }

    const cashRegister = this.openCashRegister();
    if (!cashRegister) {
      this.errorModalService.show('Nenhum caixa aberto. Abra um caixa antes de registrar o pagamento.');
      return;
    }

    this.creatingPayment.set(true);
    this.serviceOrderPaymentService.create({
      cashRegisterId: cashRegister.id,
      serviceOrderId: orderId,
      paymentMethodId,
      amount: this.total()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: createdPayment }) => {
        this.creatingPayment.set(false);
        this.payment.set(createdPayment);
        this.successModalService.show('Pagamento registrado! Agora pague cada parcela.');
      },
      error: (err: HttpErrorResponse) => {
        this.creatingPayment.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao registrar pagamento');
      }
    });
  }

  payInstallment(installment: PaymentInstallment): void {
    const currentPayment = this.payment();
    if (!currentPayment) {
      return;
    }

    const cashRegister = this.openCashRegister();
    if (!cashRegister) {
      this.errorModalService.show('Nenhum caixa aberto. Abra um caixa antes de pagar a parcela.');
      return;
    }

    this.payingInstallmentId.set(installment.id);
    this.serviceOrderPaymentService.payInstallment({
      paymentId: currentPayment.id,
      cashRegisterId: cashRegister.id,
      installmentId: installment.id
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: paidInstallment }) => {
        this.payingInstallmentId.set(null);
        this.payment.update(p => p && {
          ...p,
          paymentInstallments: p.paymentInstallments.map(i => i.id === paidInstallment.id ? paidInstallment : i)
        });
        this.successModalService.show('Parcela paga com sucesso!');
        this.refreshOrderStatus();
      },
      error: (err: HttpErrorResponse) => {
        this.payingInstallmentId.set(null);
        this.errorModalService.show(err.error?.message || 'Falha ao pagar parcela');
      }
    });
  }

  private refreshOrderStatus(): void {
    const id = this.orderId();
    if (!id) return;
    this.serviceOrderService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: order }) => this.orderStatus.set(order.orderStatus)
    });
  }

  onProductChange(productId: number): void {
    if (productId) {
      const product = this.products().find(p => p.id === productId);
      if (product) {
        this.productItemForm.patchValue({ unitPrice: product.price });
      }
    }
  }

  onServiceChange(serviceId: number): void {
    if (serviceId) {
      const service = this.services().find(s => s.id === serviceId);
      if (service) {
        this.serviceItemForm.patchValue({ unitPrice: service.price });
      }
    }
  }

  getServiceName(item: ServiceOrderItem): string {
    return item.item?.name || this.services().find(s => s.id === item.itemId)?.name || `Serviço #${item.itemId}`;
  }

  getProductName(item: ServiceOrderItem): string {
    return item.item?.name || this.products().find(p => p.id === item.itemId)?.name || `Produto #${item.itemId}`;
  }

  getResponsibleName(item: ServiceOrderItem): string {
    return this.users().find(u => String(u.id) === String(item.responsibleUserId))?.fullName || '—';
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

    this.serviceOrderService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: order }) => {
        this.orderStatus.set(order.orderStatus);
        // emitEvent:false porque isso é dados vindos do servidor, não uma edição do
        // usuário — não deve disparar o auto-save (debounced) do campo discount.
        this.orderForm.patchValue({
          clientId: order.clientId,
          discount: order.discount,
          notes: order.notes || ''
        }, { emitEvent: false });
        this.discountValue.set(order.discount ?? null);

        this.loadOrderItems(id);
        this.loadPayment(id);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/service-orders']);
      }
    });
  }

  private loadOrderItems(serviceOrderId: number): void {
    this.serviceOrderItemService.getAll(serviceOrderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.orderItems.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  createOrder(): void {
    if (this.orderForm.get('discount')?.invalid) {
      this.orderForm.get('discount')?.markAsTouched();
      return;
    }

    this.creatingOrder.set(true);
    const payload = {
      clientId: this.orderForm.get('clientId')?.value || null,
      discount: this.orderForm.get('discount')?.value || null,
      notes: this.orderForm.get('notes')?.value || null
    };

    this.serviceOrderService.create(payload as any).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: order }) => {
        this.orderId.set(order.id);
        this.creatingOrder.set(false);
        this.activeTabIndex.set(1);
        this.successModalService.show('Ordem criada! Agora adicione serviços e produtos.');
      },
      error: (err: HttpErrorResponse) => {
        this.creatingOrder.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao criar a ordem de serviço');
      }
    });
  }

  saveBasicInfo(): void {
    if (this.orderForm.get('discount')?.invalid) {
      this.orderForm.get('discount')?.markAsTouched();
      return;
    }

    this.savingInfo.set(true);
    this.persistOrderChanges().subscribe({
      next: () => {
        this.savingInfo.set(false);
        this.successModalService.show('Informações atualizadas!');
      },
      error: (err: HttpErrorResponse) => {
        this.savingInfo.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao atualizar a ordem');
      }
    });
  }

  private persistOrderChanges(): Observable<ApiResponse<ServiceOrder>> {
    const id = this.orderId();
    if (id === null) {
      throw new Error('persistOrderChanges chamado sem orderId definido');
    }
    return this.serviceOrderService.update({
      id,
      clientId: this.orderForm.get('clientId')?.value || null,
      discount: this.orderForm.get('discount')?.value || 0,
      notes: this.orderForm.get('notes')?.value || null
    });
  }

  private syncOrderTotals(): void {
    if (!this.orderId()) {
      return;
    }
    this.persistOrderChanges().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (err: HttpErrorResponse) => this.errorModalService.show(err.error?.message || 'Falha ao atualizar o total da ordem')
    });
  }

  addServiceItem(): void {
    const orderId = this.orderId();
    if (this.serviceItemForm.invalid || !orderId) {
      this.serviceItemForm.markAllAsTouched();
      return;
    }

    this.addingServiceItem.set(true);
    const value = this.serviceItemForm.value;
    const payload = {
      serviceOrderId: orderId,
      catalogItemId: value.serviceId,
      responsibleUserId: value.responsibleUserId,
      quantity: value.quantity
    };

    this.serviceOrderItemService.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: created }) => {
        this.orderItems.update(items => [...items, created]);
        this.serviceItemForm.reset({ serviceId: null, responsibleUserId: null, quantity: 1, unitPrice: 0 });
        this.addingServiceItem.set(false);
        this.syncOrderTotals();
      },
      error: (err: HttpErrorResponse) => {
        this.addingServiceItem.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao adicionar serviço');
      }
    });
  }

  addProductItem(): void {
    const orderId = this.orderId();
    if (this.productItemForm.invalid || !orderId) {
      this.productItemForm.markAllAsTouched();
      return;
    }

    this.addingProductItem.set(true);
    const value = this.productItemForm.value;
    const payload = {
      serviceOrderId: orderId,
      catalogItemId: value.productId,
      quantity: value.quantity
    };

    this.serviceOrderItemService.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: created }) => {
        this.orderItems.update(items => [...items, created]);
        this.productItemForm.reset({ productId: null, quantity: 1, unitPrice: 0 });
        this.addingProductItem.set(false);
        this.syncOrderTotals();
      },
      error: (err: HttpErrorResponse) => {
        this.addingProductItem.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao adicionar produto');
      }
    });
  }

  removeLineItem(item: ServiceOrderItem): void {
    this.removingItemId.set(item.id);
    this.serviceOrderItemService.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.orderItems.update(items => items.filter(i => i.id !== item.id));
        this.removingItemId.set(null);
        this.syncOrderTotals();
      },
      error: (err: HttpErrorResponse) => {
        this.removingItemId.set(null);
        this.errorModalService.show(err.error?.message || 'Falha ao remover item');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/service-orders']);
  }

  requestCancelOrder(): void {
    this.showCancelConfirmation.set(true);
  }

  cancelOrderDismiss(): void {
    this.showCancelConfirmation.set(false);
  }

  confirmCancelOrder(): void {
    const id = this.orderId();
    if (!id) return;

    this.cancelling.set(true);
    this.serviceOrderService.cancel(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: order }) => {
        this.cancelling.set(false);
        this.showCancelConfirmation.set(false);
        this.orderStatus.set(order.orderStatus);
        this.successModalService.show('Ordem de serviço cancelada com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        this.cancelling.set(false);
        this.showCancelConfirmation.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao cancelar a ordem de serviço');
      }
    });
  }
}
