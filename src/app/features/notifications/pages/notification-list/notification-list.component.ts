import { UtcDatePipe } from '../../../../shared/pipes/utc-date.pipe';
import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService, Notification } from '../../services/notification.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [UtcDatePipe, CommonModule, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  private errorModalService = inject(ErrorModalService);

  notifications = signal<Notification[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  rows = 10;

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const pageNumber = Math.floor((event.first ?? 0) / this.rows) + 1;

    this.notificationService.getAll(pageNumber, this.rows).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.notifications.set(response.data);
        this.totalRecords.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao carregar notificações');
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao marcar notificação como lida');
      }
    });
  }

  getNotificationIcon(n: Notification): string {
    return n.notificationType === 0 ? 'pi pi-bell' : 'pi pi-info-circle';
  }
}
