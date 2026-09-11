import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ServiceOrderService } from '../../services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ServiceOrderItem, ProductOption, ServiceOption } from '../../../service-order-items/models/service-order-item.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-service-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
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
  private authService = inject(AuthService);
  private errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  orders = signal<ServiceOrder[]>([]);
  loading = signal(true);
  showDeleteConfirmation = signal(false);
  deleteLoading = signal(false);
  orderToDelete: { id: number; orderNumber: string } | null = null;
  OrderStatus = OrderStatus;
  expandedRows: Record<number, boolean> = {};
  orderItems: Record<number, ServiceOrderItem[]> = {};

  products = signal<ProductOption[]>([]);
  services = signal<ServiceOption[]>([]);

  showCancelConfirmation = signal(false);
  cancelLoading = signal(false);
  orderToCancel: { id: number; orderNumber: string } | null = null;

  showCompleteConfirmation = signal(false);
  completeLoading = signal(false);
  orderToComplete: { id: number; orderNumber: string } | null = null;

  ngOnInit(): void {
    this.loadOrders();
    this.loadCatalogOptions();
  }

  private loadCatalogOptions(): void {
    this.serviceOrderItemService.getProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => this.products.set(response.data),
      error: (err) => this.errorModalService.show(err.error?.message || 'Falha ao carregar produtos')
    });
    this.serviceOrderItemService.getServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => this.services.set(response.data),
      error: (err) => this.errorModalService.show(err.error?.message || 'Falha ao carregar serviços')
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.serviceOrderService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar ordens de serviço');
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
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadOrders();
        this.orderToDelete = null;
      },
      error: (err: HttpErrorResponse) => {
        this.deleteLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao excluir ordem de serviço');
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
    this.serviceOrderItemService.getAll(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.orderItems[orderId] = response.data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao carregar itens da ordem');
      }
    });
  }

  getItemName(item: ServiceOrderItem): string {
    return item.item?.name || `Item #${item.itemId}`;
  }

  getItemType(item: ServiceOrderItem): string {
    return this.products().some(p => p.id === item.itemId) ? 'Produto' : 'Serviço';
  }

  getStatusLabel(status: OrderStatus): string {
    const labels = {
      [OrderStatus.Draft]: 'Rascunho',
      [OrderStatus.Open]: 'Em Aberto',
      [OrderStatus.Paid]: 'Paga',
      [OrderStatus.Completed]: 'Concluída',
      [OrderStatus.Cancelled]: 'Cancelada'
    };
    return labels[status] ?? 'Desconhecido';
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities = {
      [OrderStatus.Draft]: 'secondary' as const,
      [OrderStatus.Open]: 'warning' as const,
      [OrderStatus.Paid]: 'info' as const,
      [OrderStatus.Completed]: 'success' as const,
      [OrderStatus.Cancelled]: 'danger' as const
    };
    return severities[status] ?? 'secondary';
  }

  canCancelOrder(order: ServiceOrder): boolean {
    return order.orderStatus === OrderStatus.Draft || order.orderStatus === OrderStatus.Open;
  }

  canCompleteOrder(order: ServiceOrder): boolean {
    return order.orderStatus === OrderStatus.Paid;
  }

  cancelOrder(id: number, orderNumber: string): void {
    this.orderToCancel = { id, orderNumber };
    this.showCancelConfirmation.set(true);
  }

  confirmCancelOrder(): void {
    if (!this.orderToCancel) return;

    this.cancelLoading.set(true);
    this.serviceOrderService.cancel(this.orderToCancel.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.cancelLoading.set(false);
        this.showCancelConfirmation.set(false);
        this.successModalService.show('Ordem de serviço cancelada com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadOrders();
        this.orderToCancel = null;
      },
      error: (err: HttpErrorResponse) => {
        this.cancelLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao cancelar a ordem de serviço');
      }
    });
  }

  cancelCancelOrder(): void {
    this.showCancelConfirmation.set(false);
    this.orderToCancel = null;
  }

  completeOrder(id: number, orderNumber: string): void {
    this.orderToComplete = { id, orderNumber };
    this.showCompleteConfirmation.set(true);
  }

  confirmCompleteOrder(): void {
    if (!this.orderToComplete) return;

    this.completeLoading.set(true);
    this.serviceOrderService.complete(this.orderToComplete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.completeLoading.set(false);
        this.showCompleteConfirmation.set(false);
        this.successModalService.show('Ordem de serviço concluída com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.loadOrders();
        this.orderToComplete = null;
      },
      error: (err: HttpErrorResponse) => {
        this.completeLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao concluir a ordem de serviço');
      }
    });
  }

  cancelCompleteOrder(): void {
    this.showCompleteConfirmation.set(false);
    this.orderToComplete = null;
  }

  getCompleteMessage(): string {
    return this.orderToComplete
      ? `Tem certeza que deseja concluir a ordem "${this.orderToComplete.orderNumber}"? Isso permitirá a aplicação de comissão.`
      : '';
  }

  getCancelMessage(): string {
    return this.orderToCancel
      ? `Tem certeza que deseja cancelar a ordem "${this.orderToCancel.orderNumber}"?`
      : '';
  }

  getDeleteMessage(): string {
    return this.orderToDelete
      ? `Tem certeza que deseja excluir a ordem "${this.orderToDelete.orderNumber}"?`
      : '';
  }

  hasPermission(permission: string): boolean {
    return this.authService.userPermissions().includes(permission);
  }
}
