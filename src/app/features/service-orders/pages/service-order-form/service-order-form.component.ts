// src/app/features/service-orders/pages/service-order-form/service-order-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceOrderService } from '../../services/service-order.service';
import { ServiceOrderFormData, Client, CashRegister, OrderStatus } from '../../models/service-order.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-service-order-form',
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
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss']
})
export class ServiceOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  successModalService = inject(SuccessModalService);

  orderForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  orderId = signal<number | null>(null);
  clients = signal<Client[]>([]);
  cashRegisters = signal<CashRegister[]>([]);
  clientsLoading = signal(true);
  cashRegistersLoading = signal(true);

  // Confirmation modal
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  orderStatusOptions = [
    { label: 'Pendente', value: OrderStatus.Pending },
    { label: 'Em Andamento', value: OrderStatus.InProgress },
    { label: 'Concluído', value: OrderStatus.Completed },
    { label: 'Cancelado', value: OrderStatus.Cancelled }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadCashRegisters();
    this.checkEditMode();
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      orderNumber: ['', [Validators.required, Validators.minLength(3)]],
      clientId: ['', Validators.required],
      discount: [0, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0.01)]],
      orderStatus: [OrderStatus.Pending, Validators.required],
      cashRegisterId: ['', Validators.required],
      notes: ['']
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

  private loadCashRegisters(): void {
    this.cashRegistersLoading.set(true);
    this.serviceOrderService.getCashRegisters().subscribe({
      next: (response) => {
        this.cashRegisters.set(response.data);
        this.cashRegistersLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar caixas'
        });
        this.cashRegistersLoading.set(false);
      }
    });
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
          orderNumber: order.orderNumber,
          clientId: order.clientId,
          discount: order.discount,
          total: order.total,
          orderStatus: order.orderStatus,
          cashRegisterId: order.cashRegisterId,
          notes: order.notes || ''
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar ordem de serviço'
        });
        this.router.navigate(['/service-orders']);
      }
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: ServiceOrderFormData = this.orderForm.value;

    const payload = this.isEditMode()
      ? { id: this.orderId()!, ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.serviceOrderService.update(payload)
      : this.serviceOrderService.create(formData);

    operation.subscribe({
      next: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Ordem de serviço atualizada com sucesso!'
            : 'Ordem de serviço criada com sucesso!'
        );

        setTimeout(() => {
          this.router.navigate(['/service-orders']);
        }, 2500);
      },
      error: () => {
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: this.isEditMode()
            ? 'Falha ao atualizar ordem de serviço'
            : 'Falha ao criar ordem de serviço'
        });
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
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
