// src/app/features/layout/sidebar/sidebar.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isCollapsed = input(false);

  // Menu items - ajuste conforme suas rotas reais
  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Calendário', icon: 'pi pi-calendar', route: '/calendar-events' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/clients' },
      { label: 'Usuários', icon: 'pi pi-users', route: '/users' },
    //{ label: 'Empresas', icon: 'pi pi-building', route: '/empresas' },
    //{ label: 'Funcionários', icon: 'pi pi-id-card', route: '/funcionarios' },
    { label: 'Produtos', icon: 'pi pi-box', route: '/products' },
    { label: 'Serviços', icon: 'pi pi-briefcase', route: '/services' },
    { label: 'Marcas', icon: 'pi pi-tag', route: '/brands' },
    { label: 'Categorias', icon: 'pi pi-list', route: '/categories' },
    { label: 'Ordens de Serviço', icon: 'pi pi-file-edit', route: '/service-orders' },
    //{ label: 'Triagem', icon: 'pi pi-heart', route: '/triagem' },
    //{ label: 'Gerar Senhas', icon: 'pi pi-ticket', route: '/senhas' }
  ];
}
