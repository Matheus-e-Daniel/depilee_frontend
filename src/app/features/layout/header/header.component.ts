// src/app/features/layout/header/header.component.ts
import { Component, output, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MenuModule, BadgeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private notificationSub?: Subscription;

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
  ngOnInit(): void {
    this.fetchNotifications();
    this.notificationSub = interval(30000).subscribe(() => this.fetchNotifications());
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }

  private fetchNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (response: any) => {
        // O backend retorna { data: Notification[], ... }
        const allItems = response.data || [];
        // Filtrar apenas notificações com notificationStatus === 0
        const items = allItems.filter((n: any) => n.notificationStatus === 0);
        this.notificationCount = items.length;
        this.notificationItems = [
          ...items.map((n: any) => ({
            label: n.title,
            icon: this.getNotificationIcon(n),
            badge: this.getNotificationBadge(n),
            id: n.id,
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

  private getNotificationIcon(n: any): string {
    // Exemplo: pode customizar por tipo
    if (n.notificationType === 0) return 'pi pi-bell';
    return 'pi pi-info-circle';
  }

  private getNotificationBadge(n: any): string {
    // Exemplo: pode customizar badge, aqui só mostra data/hora
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
    console.log('Ir para perfil');
    // this.router.navigate(['/profile']);
  }

  private goToSettings(): void {
    console.log('Ir para configurações');
    // this.router.navigate(['/settings']);
  }

  viewNotification(id: number): void {
    console.log('Visualizar notificação:', id);
  }

  viewAllNotifications(): void {
    console.log('Ver todas as notificações');
  }

  markAllAsRead(): void {
    this.notificationCount = 0;
    console.log('Todas as notificações marcadas como lidas');
  }

  markNotificationAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notificationItems = this.notificationItems.filter((item: any) => item.id !== id);
        this.notificationCount = Math.max(0, this.notificationCount - 1);
      },
      error: (err) => {
        console.error('Erro ao marcar notificação como lida:', err);
      }
    });
  }
}
