import { Component, output, inject, signal, ViewChild, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification } from '../../notifications/services/notification.service';
import { ProfileComponent } from '../../profile/profile.component';
import { ErrorModalService } from '../../../shared/components/error-modal/error-modal.service';
import { interval, forkJoin } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MenuModule, BadgeModule, ProfileComponent],
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
  showProfileCard = signal(false);

  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => this.goToSettings()
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

  ngOnInit(): void {
    this.fetchNotifications();
    interval(30000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.fetchNotifications());
  }

  private fetchNotifications(): void {
    this.notificationService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const unread = response.data.filter(n => n.notificationStatus === 0);
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
    this.showProfileCard.set(true);
  }

  private goToSettings(): void {
    this.router.navigate(['/commissions/settings']);
  }

  viewNotification(_id: number): void { }

  viewAllNotifications(): void { }

  markAllAsRead(): void {
    const ids = [...this.unreadIds];
    if (ids.length === 0) return;

    forkJoin(ids.map(id => this.notificationService.markAsRead(id)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.unreadIds = [];
          this.notificationCount = 0;
          const removedIds = ids.map(String);
          this.notificationItems = this.notificationItems.filter((item: MenuItem) => !removedIds.includes(item.id!));
        },
        error: (err: HttpErrorResponse) => {
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
