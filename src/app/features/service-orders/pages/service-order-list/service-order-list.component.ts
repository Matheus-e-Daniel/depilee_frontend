// src/app/features/service-orders/pages/service-order-list/service-order-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceOrderService } from '../../services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../models/service-order.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-service-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  providers: [MessageService],
  templateUrl: './service-order-list.component.html',
  styleUrls: ['./service-order-list.component.scss']
})
export class ServiceOrderListComponent implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  orders = signal<ServiceOrder[]>([]);
  loading = signal(true);
  showDeleteConfirmation = signal(false);
  deleteLoading = signal(false);
  orderToDelete: { id: number; orderNumber: string } | null = null;
  OrderStatus = OrderStatus;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.serviceOrderService.getAll().subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar ordens de serviço'
        });
        this.loading.set(false);
      }
    });
  }

  editOrder(id: number): void {
    this.router.navigate(['/service-orders/edit', id]);
  }

  deleteOrder(id: number, orderNumber: string): void {
    this.orderToDelete = { id, orderNumber };
    this.showDeleteConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.orderToDelete) return;

    this.deleteLoading.set(true);
    this.serviceOrderService.delete(this.orderToDelete.id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.showDeleteConfirmation.set(false);
        this.successModalService.show('Ordem de serviço excluída com sucesso!');
        this.loadOrders();
        this.orderToDelete = null;
      },
      error: () => {
        this.deleteLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir ordem de serviço'
        });
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
    this.orderToDelete = null;
  }

  newOrder(): void {
    this.router.navigate(['/service-orders/new']);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels = {
      [OrderStatus.Pending]: 'Pendente',
      [OrderStatus.InProgress]: 'Em Andamento',
      [OrderStatus.Completed]: 'Concluído',
      [OrderStatus.Cancelled]: 'Cancelado'
    };
    return labels[status] || 'Desconhecido';
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities = {
      [OrderStatus.Pending]: 'warning' as const,
      [OrderStatus.InProgress]: 'info' as const,
      [OrderStatus.Completed]: 'success' as const,
      [OrderStatus.Cancelled]: 'danger' as const
    };
    return severities[status] || 'secondary';
  }

  getDeleteMessage(): string {
    return this.orderToDelete
      ? `Tem certeza que deseja excluir a ordem "${this.orderToDelete.orderNumber}"?`
      : '';
  }
}
