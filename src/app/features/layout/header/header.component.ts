// src/app/features/layout/header/header.component.ts
import { Component, output, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MenuModule, BadgeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('notificationMenu') notificationMenu!: Menu;
  @ViewChild('userMenu') userMenu!: Menu;

  toggleSidebar = output<void>();
  notificationCount = 3;

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

  notificationItems: MenuItem[] = [
    {
      label: 'Nova consulta agendada',
      icon: 'pi pi-calendar',
      badge: 'Há 5 min',
      command: () => this.viewNotification(1)
    },
    {
      label: 'Pagamento confirmado',
      icon: 'pi pi-check-circle',
      badge: 'Há 1 hora',
      command: () => this.viewNotification(2)
    },
    {
      label: 'Novo paciente cadastrado',
      icon: 'pi pi-user-plus',
      badge: 'Hoje',
      command: () => this.viewNotification(3)
    },
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
}
