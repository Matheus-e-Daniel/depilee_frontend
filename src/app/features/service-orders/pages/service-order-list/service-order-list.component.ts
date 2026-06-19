import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ServiceOrderService } from '../../services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ServiceOrderItem } from '../../../service-order-items/models/service-order-item.model';
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
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './service-order-list.component.html',
  styleUrls: ['./service-order-list.component.scss']
})
export class ServiceOrderListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private serviceOrderService = inject(ServiceOrderService);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  orders = signal<ServiceOrder[]>([]);
  loading = signal(true);
  showDeleteConfirmation = signal(false);
  deleteLoading = signal(false);
  orderToDelete: { id: number; orderNumber: string } | null = null;
  OrderStatus = OrderStatus;
  expandedRows: { [key: number]: boolean } = {};
  orderItems: { [key: number]: ServiceOrderItem[] } = {};

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.serviceOrderService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.loading.set(false);
      },
      error: () => {
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
    this.serviceOrderService.delete(this.orderToDelete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.showDeleteConfirmation.set(false);
        this.successModalService.show('Ordem de serviço excluída com sucesso!');
        this.loadOrders();
        this.orderToDelete = null;
      },
      error: () => {
        this.deleteLoading.set(false);
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

  toggleRow(orderId: number): void {
    this.expandedRows[orderId] = !this.expandedRows[orderId];

    if (this.expandedRows[orderId] && !this.orderItems[orderId]) {
      this.loadOrderItems(orderId);
    }
  }

  loadOrderItems(orderId: number): void {
    this.serviceOrderItemService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const filteredItems = response.data.filter(
          item => item.serviceOrderId === orderId
        );

        this.orderItems[orderId] = filteredItems;

        this.loadItemDetails(filteredItems);
      },
      error: () => {
      }
    });
  }

  private loadItemDetails(_items: ServiceOrderItem[]): void { }

  getItemName(item: ServiceOrderItem): string {
    if (item.productName) return item.productName;
    if (item.serviceName) return item.serviceName;
    if (item.productId) return `Produto ID: ${item.productId}`;
    if (item.serviceId) return `Serviço ID: ${item.serviceId}`;
    return 'Sem produto/serviço';
  }

  getItemType(item: ServiceOrderItem): string {
    return item.productId ? 'Produto' : 'Serviço';
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
