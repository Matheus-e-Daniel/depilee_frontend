import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isCollapsed = input(false);

  private allMenuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Calendário', icon: 'pi pi-calendar', route: '/calendar-events', permissions: ['Event.Get'] },
    { label: 'Clientes', icon: 'pi pi-users', route: '/clients', permissions: ['Client.Get'] },
    { label: 'Usuários', icon: 'pi pi-users', route: '/users', permissions: ['Identity.Get'] },
    { label: 'Produtos', icon: 'pi pi-box', route: '/products', permissions: ['Product.Get'] },
    { label: 'Serviços', icon: 'pi pi-briefcase', route: '/services', permissions: ['Service.Get'] },
    { label: 'Marcas', icon: 'pi pi-tag', route: '/brands', permissions: ['Brand.Get'] },
    { label: 'Categorias', icon: 'pi pi-list', route: '/categories', permissions: ['Category.Get'] },
    { label: 'Ordens de Serviço', icon: 'pi pi-file-edit', route: '/service-orders', permissions: ['ServiceOrder.Get'] },
    { label: 'Caixas', icon: 'pi pi-wallet', route: '/cash-registers', permissions: ['CashRegister.Get'] },
    { label: 'Métodos de Pagamento', icon: 'pi pi-credit-card', route: '/payment-methods', permissions: ['PaymentMethod.Get'] },
    { label: 'Movimentação de Estoque', icon: 'pi pi-history', route: '/stock-movements', permissions: ['StockMovement.Get'] },
    { label: 'Cargos', icon: 'pi pi-id-card', route: '/roles', permissions: ['Identity.Get'] },
    { label: 'Config. Comissão', icon: 'pi pi-sliders-h', route: '/commissions/settings', permissions: ['Commission.Get', 'Commission.Edit'] },
    { label: 'Aplicar Comissão', icon: 'pi pi-percentage', route: '/commissions/apply', permissions: ['Commission.Create'] },
    { label: 'Histórico Comissão', icon: 'pi pi-chart-bar', route: '/commissions/history', permissions: ['Commission.Get'] },
  ];

  menuItems = computed(() =>
    this.allMenuItems.filter(item => !item.permissions || this.authService.hasAnyPermission(item.permissions))
  );
}
