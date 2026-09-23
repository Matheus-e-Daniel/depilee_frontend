import { UtcDatePipe } from '../../../../shared/pipes/utc-date.pipe';
import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { CommissionService } from '../../services/commission.service';
import { CommissionResult } from '../../models/commission.model';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/models/user.model';
import { ServiceOrderService } from '../../../service-orders/services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../../service-orders/models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ServiceOrderItem, ServiceOption } from '../../../service-order-items/models/service-order-item.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

@Component({
  selector: 'app-commission-apply',
  standalone: true,
  imports: [UtcDatePipe, 
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
    ConfirmationModalComponent
  ],
  templateUrl: './commission-apply.component.html',
  styleUrls: ['./commission-apply.component.scss']
})
export class CommissionApplyComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private commissionService = inject(CommissionService);
  private userService = inject(UserService);
  private serviceOrderService = inject(ServiceOrderService);
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private errorModalService = inject(ErrorModalService);

  users = signal<User[]>([]);
  allOrders = signal<ServiceOrder[]>([]);
  allItems = signal<ServiceOrderItem[]>([]);
  services = signal<ServiceOption[]>([]);
  selectedUserId = signal<number | null>(null);
  selectedItemIds = signal<Set<number>>(new Set());
  applyResult = signal<CommissionResult | null>(null);
  dataLoading = signal(true);
  applying = signal(false);
  showConfirmation = signal(false);

  userOptions = computed(() =>
    this.users().map(u => ({ label: u.fullName || u.email, value: u.id }))
  );

  filteredItems = computed(() => {
    const userId = this.selectedUserId();
    if (!userId) return [];

    const serviceIds = new Set(this.services().map(s => s.id));

    return this.allItems().filter(item =>
      item.responsibleUserId === userId &&
      serviceIds.has(item.itemId)
    );
  });

  alreadyCommissionedCount = computed(() => {
    const ids = this.selectedItemIds();
    return this.allItems()
      .filter(i => ids.has(i.id) && i.commissionAmount != null)
      .length;
  });

  confirmationMessage = computed(() => {
    const count = this.alreadyCommissionedCount();
    const total = this.selectedItemIds().size;
    if (count > 0) {
      return `${count} item(s) já possuem comissão aplicada e serão recalculados com a configuração atual. Deseja confirmar para ${total} item(s)?`;
    }
    return `Deseja aplicar comissão para ${total} item(s) selecionado(s)?`;
  });

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAll(),
      orders: this.serviceOrderService.getAll(),
      services: this.serviceOrderItemService.getServices()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ users, orders, services }) => {
        this.users.set(users.data);
        this.allOrders.set(orders.data);
        this.services.set(services.data);

        // O endpoint de itens exige serviceOrderId — não existe "listar todos os itens
        // de todas as ordens" no backend, então buscamos por ordem concluída e juntamos.
        const completedOrderIds = orders.data
          .filter(o => o.orderStatus === OrderStatus.Completed)
          .map(o => o.id);

        if (completedOrderIds.length === 0) {
          this.allItems.set([]);
          this.dataLoading.set(false);
          return;
        }

        forkJoin(completedOrderIds.map(id => this.serviceOrderItemService.getAll(id)))
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (responses) => {
              this.allItems.set(responses.flatMap(r => r.data));
              this.dataLoading.set(false);
            },
            error: () => {
              this.dataLoading.set(false);
            }
          });
      },
      error: () => {
        this.dataLoading.set(false);
      }
    });
  }

  onUserChange(userId: number | null): void {
    this.selectedUserId.set(userId);
    this.selectedItemIds.set(new Set());
  }

  isSelected(id: number): boolean {
    return this.selectedItemIds().has(id);
  }

  toggleItem(id: number): void {
    const set = new Set(this.selectedItemIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.selectedItemIds.set(set);
  }

  toggleAll(): void {
    const items = this.filteredItems();
    const ids = new Set(this.selectedItemIds());
    const allSelected = items.every(i => ids.has(i.id));
    if (allSelected) {
      items.forEach(i => ids.delete(i.id));
    } else {
      items.forEach(i => ids.add(i.id));
    }
    this.selectedItemIds.set(ids);
  }

  getOrderNumber(item: ServiceOrderItem): string {
    return this.allOrders().find(o => o.id === item.serviceOrderId)?.orderNumber || `OS #${item.serviceOrderId}`;
  }

  isAllSelected(): boolean {
    const items = this.filteredItems();
    return items.length > 0 && items.every(i => this.selectedItemIds().has(i.id));
  }

  onApplyClick(): void {
    if (this.selectedItemIds().size === 0) return;
    this.showConfirmation.set(true);
  }

  confirmApply(): void {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.applying.set(true);
    this.showConfirmation.set(false);

    this.commissionService.applyCommission({
      userId,
      serviceOrderItemIds: Array.from(this.selectedItemIds())
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: result }) => {
        this.applying.set(false);
        this.applyResult.set(result);
      },
      error: (err: HttpErrorResponse) => {
        this.applying.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao aplicar comissão');
      }
    });
  }

  cancelApply(): void {
    this.showConfirmation.set(false);
  }

  resetForm(): void {
    this.applyResult.set(null);
    this.selectedItemIds.set(new Set());
    this.selectedUserId.set(null);
  }
}
