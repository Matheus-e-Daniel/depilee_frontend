import { Component, output, inject, ViewChild, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification } from '../../notifications/services/notification.service';
import { ErrorModalService } from '../../../shared/components/error-modal/error-modal.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MenuModule, BadgeModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private errorModalService = inject(ErrorModalService);

  @ViewChild('notificationMenu') notificationMenu!: Menu;
  @ViewChild('userMenu') userMenu!: Menu;

  toggleSidebar = output<void>();
  notificationCount = 0;

  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    { separator: true },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  notificationItems: MenuItem[] = [];
  private unreadIds: number[] = [];
  private markingAllAsRead = false;

  ngOnInit(): void {
    this.fetchNotifications();
    interval(30000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.fetchNotifications());
  }

  private fetchNotifications(): void {
    this.notificationService.getAll(1, 10, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const unread = response.data;
        this.unreadIds = unread.map(n => n.id);
        this.notificationCount = unread.length;
        this.notificationItems = [
          ...unread.map(n => ({
            label: n.title,
            icon: this.getNotificationIcon(n),
            badge: this.getNotificationBadge(n),
            id: String(n.id),
            command: () => this.viewNotification(n.id)
          })),
          { separator: true },
          {
            label: 'Ver todas as notificações',
            icon: 'pi pi-list',
            command: () => this.viewAllNotifications()
          },
          {
            label: 'Marcar todas como lidas',
            icon: 'pi pi-check',
            command: () => this.markAllAsRead()
          }
        ];
      },
      error: () => {
        this.notificationItems = [
          { label: 'Erro ao carregar notificações', icon: 'pi pi-exclamation-triangle', disabled: true }
        ];
      }
    });
  }

  private getNotificationIcon(n: Notification): string {
    if (n.notificationType === 0) return 'pi pi-bell';
    return 'pi pi-info-circle';
  }

  private getNotificationBadge(n: Notification): string {
    if (!n.createdAt) return '';
    const date = new Date(n.createdAt);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  toggleNotificationMenu(event: Event): void {
    this.notificationMenu.toggle(event);
  }

  toggleUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
  }

  private goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  viewNotification(id: number): void {
    this.notificationService.markAsRead(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.fetchNotifications(),
      error: (err: HttpErrorResponse) => this.errorModalService.show(err.error?.message || 'Falha ao marcar notificação como lida')
    });
    this.router.navigate(['/notifications']);
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  markAllAsRead(): void {
    if (this.markingAllAsRead || this.unreadIds.length === 0) return;

    this.markingAllAsRead = true;
    this.notificationService.markAllAsRead().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.markingAllAsRead = false;
        this.fetchNotifications();
      },
      error: (err: HttpErrorResponse) => {
        this.markingAllAsRead = false;
        this.errorModalService.show(err.error?.message || 'Falha ao marcar notificações como lidas');
      }
    });
  }

  markNotificationAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.unreadIds = this.unreadIds.filter(unreadId => unreadId !== id);
        this.notificationItems = this.notificationItems.filter((item: MenuItem) => item.id !== String(id));
        this.notificationCount = Math.max(0, this.notificationCount - 1);
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao marcar notificação como lida');
      }
    });
  }
}
