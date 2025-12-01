// src/app/features/layout/header/header.component.ts
import { Component, output, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('menu') menu!: Menu;

  toggleSidebar = output<void>();

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  toggleUserMenu(event: Event): void {
    this.menu.toggle(event);
  }

  menuItems = [
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
}
