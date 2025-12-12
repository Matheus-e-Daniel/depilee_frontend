// src/app/features/service-order-items/pages/service-order-item-list/service-order-item-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceOrderItemService } from '../../services/service-order-item.service';
import { ServiceOrderItem } from '../../models/service-order-item.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-service-order-item-list',
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
  templateUrl: './service-order-item-list.component.html',
  styleUrls: ['./service-order-item-list.component.scss']
})
export class ServiceOrderItemListComponent implements OnInit {
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  items = signal<ServiceOrderItem[]>([]);
  loading = signal(true);
  showDeleteConfirmation = signal(false);
  deleteLoading = signal(false);
  itemToDelete: { id: number; name: string } | null = null;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.serviceOrderItemService.getAll().subscribe({
      next: (response) => {
        this.items.set(response.data);
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

  editItem(id: number): void {
    this.router.navigate(['/service-order-items/edit', id]);
  }

  deleteItem(id: number, itemName: string): void {
    this.itemToDelete = { id, name: itemName };
    this.showDeleteConfirmation.set(true);
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.deleteLoading.set(true);
    this.serviceOrderItemService.delete(this.itemToDelete.id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.showDeleteConfirmation.set(false);
        this.successModalService.show('Item excluído com sucesso!');
        this.loadItems();
        this.itemToDelete = null;
      },
      error: () => {
        this.deleteLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir item'
        });
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
    this.itemToDelete = null;
  }

  newItem(): void {
    this.router.navigate(['/service-order-items/new']);
  }

  getItemName(item: ServiceOrderItem): string {
    return item.productName || item.serviceName || 'N/A';
  }

  getItemType(item: ServiceOrderItem): string {
    if (item.productId) return 'Produto';
    if (item.serviceId) return 'Serviço';
    return 'N/A';
  }

  getDeleteMessage(): string {
    return this.itemToDelete
      ? `Tem certeza que deseja excluir "${this.itemToDelete.name}"?`
      : '';
  }
}
