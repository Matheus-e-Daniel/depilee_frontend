import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
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
import { CommissionResult, CalculationMode } from '../../models/commission.model';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/models/user.model';
import { ServiceOrderService } from '../../../service-orders/services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../../service-orders/models/service-order.model';
import { ServiceOrderItemService } from '../../../service-order-items/services/service-order-item.service';
import { ServiceOrderItem } from '../../../service-order-items/models/service-order-item.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-commission-apply',
  standalone: true,
  imports: [
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

  users = signal<User[]>([]);
  allOrders = signal<ServiceOrder[]>([]);
  allItems = signal<ServiceOrderItem[]>([]);
  selectedUserId = signal<number | null>(null);
  selectedItemIds = signal<Set<number>>(new Set());
  applyResult = signal<CommissionResult | null>(null);
  dataLoading = signal(true);
  applying = signal(false);
  showConfirmation = signal(false);

  userOptions = computed(() =>
    this.users().map(u => ({ label: (u as any).fullName || (u as any).name || u.email, value: (u as any).id }))
  );

  filteredItems = computed(() => {
    const userId = this.selectedUserId();
    if (!userId) return [];

    const completedOrderIds = new Set(
      this.allOrders()
        .filter(o => o.orderStatus === OrderStatus.Completed)
        .map(o => o.id)
    );

    return this.allItems().filter(item =>
      (item as any).responsibleUserId === userId &&
      item.serviceId != null &&
      completedOrderIds.has(item.serviceOrderId)
    );
  });

  alreadyCommissionedCount = computed(() => {
    const ids = this.selectedItemIds();
    return this.allItems()
      .filter(i => ids.has(i.id) && (i as any).commissionAmount != null)
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

  readonly CalculationMode = CalculationMode;

  calculationModeLabel(mode: CalculationMode): string {
    const labels: Record<CalculationMode, string> = {
      [CalculationMode.ByService]: 'Por Serviço',
      [CalculationMode.ByUser]: 'Por Usuário',
      [CalculationMode.Global]: 'Global'
    };
    return labels[mode] ?? String(mode);
  }

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAll(),
      orders: this.serviceOrderService.getAll(),
      items: this.serviceOrderItemService.getAll()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ users, orders, items }) => {
        this.users.set(users);
        this.allOrders.set(orders.data);
        this.allItems.set(items.data);
        this.dataLoading.set(false);
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
      next: (result) => {
        this.applying.set(false);
        this.applyResult.set(result);
      },
      error: () => {
        this.applying.set(false);
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
