// src/app/features/service-order-items/pages/service-order-item-list/service-order-item-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ServiceOrderItemService } from '../../services/service-order-item.service';
import { ServiceOrderItem } from '../../models/service-order-item.model';

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
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './service-order-item-list.component.html',
  styleUrls: ['./service-order-item-list.component.scss']
})
export class ServiceOrderItemListComponent implements OnInit {
  private serviceOrderItemService = inject(ServiceOrderItemService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  items = signal<ServiceOrderItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.serviceOrderItemService.getAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar itens'
        });
        this.loading.set(false);
      }
    });
  }

  editItem(id: string): void {
    this.router.navigate(['/service-order-items/edit', id]);
  }

  deleteItem(id: string, itemName: string): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir "${itemName}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.serviceOrderItemService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Item excluído'
            });
            this.loadItems();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao excluir item'
            });
          }
        });
      }
    });
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
}
