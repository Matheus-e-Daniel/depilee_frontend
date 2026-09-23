import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';
import { SkeletonModule } from 'primeng/skeleton';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { ClientService } from '../clients/services/client.service';
import { Client } from '../clients/models/client.model';
import { CalendarEventService } from '../calendar-events/services/calendar-event.service';
import { CalendarEvent, EEventStatus } from '../calendar-events/models/calendar-event.model';
import { ServiceOrderService } from '../service-orders/services/service-order.service';
import { OrderStatus } from '../service-orders/models/service-order.model';
import { AuthService } from '../../core/services/auth.service';
import { ServiceService } from '../services/services/service.service';
import { ProductService } from '../products/services/product.service';
import { HomeWidgetPreferenceService } from '../../core/services/home-widget-preference.service';
import { HomeWidget } from '../../core/models/home-widget.model';

interface UpcomingEvent {
  subject: string;
  horario: string;
  duracao: string | null;
  statusLabel: string;
  statusClass: string;
  color: string;
}

interface PriceWidgetItem {
  name: string;
  price: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    SkeletonModule,
    ListboxModule,
    TagModule,
    ProgressSpinnerModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private clientService = inject(ClientService);
  private calendarEventService = inject(CalendarEventService);
  private serviceOrderService = inject(ServiceOrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private serviceService = inject(ServiceService);
  private productService = inject(ProductService);
  private homeWidgetPreferenceService = inject(HomeWidgetPreferenceService);

  loading = signal(true);
  lastUpdated: Date | null = null;

  canViewClients = false;
  canViewEvents = false;
  canViewOrders = false;
  canViewDashboard = false;

  showServicesWidget = false;
  showProductsWidget = false;
  showEventsWidget = false;
  hasAnyContent = false;
  serviceWidgetSearch = signal('');
  productWidgetSearch = signal('');
  serviceWidgetItems = signal<PriceWidgetItem[]>([]);
  productWidgetItems = signal<PriceWidgetItem[]>([]);
  filteredServiceWidgetItems = computed(() => {
    const term = this.serviceWidgetSearch().toLowerCase().trim();
    const items = this.serviceWidgetItems();
    return term ? items.filter(i => i.name.toLowerCase().includes(term)) : items;
  });
  filteredProductWidgetItems = computed(() => {
    const term = this.productWidgetSearch().toLowerCase().trim();
    const items = this.productWidgetItems();
    return term ? items.filter(i => i.name.toLowerCase().includes(term)) : items;
  });

  totalClientes = 0;
  crescimentoClientes = '0%';

  agendamentosHoje = 0;
  variacaoAgendamentos = 0;

  taxaCancelamento = 0;
  pontosVariacaoCancelamento = 0;

  selectedPeriod = '30d';
  chartPeriods = [
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
    { label: '90 dias', value: '90d' }
  ];

  chartData: ChartData<'line'> | undefined;
  chartOptions: ChartOptions<'line'> | undefined;

  proximosAgendamentos: UpcomingEvent[] = [];

  private clientes: Client[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.canViewClients = this.authService.hasAnyPermission(['Client.Get']);
    this.canViewEvents = this.authService.hasAnyPermission(['Event.Get']);
    this.canViewOrders = this.authService.hasAnyPermission(['ServiceOrder.Get']);
    this.canViewDashboard = this.authService.hasAnyPermission(['Dashboard.View']);
    const canViewServicesPerm = this.authService.hasAnyPermission(['Service.Get']);
    const canViewProductsPerm = this.authService.hasAnyPermission(['Product.Get']);

    const clients$ = this.canViewClients
      ? this.clientService.getAll().pipe(catchError(() => of(null)))
      : of(null);

    const events$ = this.canViewEvents
      ? this.calendarEventService.getAll().pipe(catchError(() => of(null)))
      : of(null);

    const orders$ = this.canViewOrders
      ? this.serviceOrderService.getAll().pipe(catchError(() => of(null)))
      : of(null);

    const homeWidgets$ = (canViewServicesPerm || canViewProductsPerm || this.canViewEvents)
      ? this.homeWidgetPreferenceService.getPreferences().pipe(catchError(() => of(null)))
      : of(null);

    const services$ = canViewServicesPerm
      ? this.serviceService.getAll().pipe(catchError(() => of(null)))
      : of(null);

    const products$ = canViewProductsPerm
      ? this.productService.getAll().pipe(catchError(() => of(null)))
      : of(null);

    forkJoin([clients$, events$, orders$, homeWidgets$, services$, products$]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([clientsRes, events, ordersRes, homeWidgetsRes, servicesRes, productsRes]) => {
        if (clientsRes) {
          this.processClients(clientsRes.data, clientsRes.totalCount);
        }
        if (events) {
          this.processEvents(events.data);
        }
        if (ordersRes) {
          this.processOrders(ordersRes.data);
        }

        const activeWidgets = homeWidgetsRes?.configured
          ? homeWidgetsRes.widgets
          : [HomeWidget.Services, HomeWidget.Products, HomeWidget.Events];

        const serviceItems: PriceWidgetItem[] = canViewServicesPerm && activeWidgets.includes(HomeWidget.Services) && servicesRes
          ? servicesRes.data.map(s => ({ name: s.name, price: s.price })).sort((a, b) => a.name.localeCompare(b.name))
          : [];
        const productItems: PriceWidgetItem[] = canViewProductsPerm && activeWidgets.includes(HomeWidget.Products) && productsRes
          ? productsRes.data.map(p => ({ name: p.name, price: p.price })).sort((a, b) => a.name.localeCompare(b.name))
          : [];
        this.serviceWidgetItems.set(serviceItems);
        this.productWidgetItems.set(productItems);
        this.showServicesWidget = serviceItems.length > 0;
        this.showProductsWidget = productItems.length > 0;
        this.showEventsWidget = this.canViewEvents && activeWidgets.includes(HomeWidget.Events);

        const hasAnalyticsContent = this.canViewDashboard && (this.canViewClients || this.canViewEvents || this.canViewOrders);
        this.hasAnyContent = hasAnalyticsContent || this.showServicesWidget || this.showProductsWidget || this.showEventsWidget;

        this.buildChart();
        this.lastUpdated = new Date();
        this.loading.set(false);
      });
  }

  refreshData(): void {
    this.loadData();
  }

  private processClients(clients: Client[], totalCount: number): void {
    this.clientes = clients;
    this.totalClientes = totalCount;

    const now = new Date();
    const inicioMesAtual = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAntesDoMes = clients.filter(client => {
      const regDate = this.parseLocalDate(client.registrationDate);
      return regDate < inicioMesAtual;
    }).length;

    if (totalAntesDoMes === 0) {
      this.crescimentoClientes = totalCount > 0 ? '+100%' : '0%';
    } else {
      const crescimento = ((totalCount - totalAntesDoMes) / totalAntesDoMes) * 100;
      const sinal = crescimento > 0 ? '+' : '';
      this.crescimentoClientes = `${sinal}${crescimento.toFixed(0)}%`;
    }
  }

  private processEvents(events: CalendarEvent[]): void {
    const now = new Date();
    const ontem = new Date(now);
    ontem.setDate(now.getDate() - 1);

    const eventosHoje = events.filter(e => e.startDate && this.isSameDay(this.parseLocalDate(e.startDate), now));
    const eventosOntem = events.filter(e => e.startDate && this.isSameDay(this.parseLocalDate(e.startDate), ontem));

    this.agendamentosHoje = eventosHoje.length;

    if (eventosOntem.length === 0) {
      this.variacaoAgendamentos = eventosHoje.length > 0 ? 1 : 0;
    } else {
      this.variacaoAgendamentos = (eventosHoje.length - eventosOntem.length) / eventosOntem.length;
    }

    this.proximosAgendamentos = events
      .filter(e => e.startDate && this.parseLocalDate(e.startDate) >= now)
      .sort((a, b) => this.parseLocalDate(a.startDate!).getTime() - this.parseLocalDate(b.startDate!).getTime())
      .slice(0, 4)
      .map(e => this.toUpcomingEvent(e));
  }

  private toUpcomingEvent(event: CalendarEvent): UpcomingEvent {
    const start = this.parseLocalDate(event.startDate!);
    const horario = event.allDay
      ? 'Dia inteiro'
      : `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;

    let duracao: string | null = null;
    if (!event.allDay && event.endDate) {
      const end = this.parseLocalDate(event.endDate);
      const minutos = Math.round((end.getTime() - start.getTime()) / 60000);
      if (minutos > 0) {
        duracao = minutos >= 60 ? `${Math.round(minutos / 60)}h` : `${minutos} min`;
      }
    }

    const statusMap: Record<number, { label: string; cssClass: string }> = {
      [EEventStatus.Done]: { label: 'Concluído', cssClass: 'done' },
      [EEventStatus.Pending]: { label: 'Pendente', cssClass: 'pending' },
      [EEventStatus.Cancelled]: { label: 'Cancelado', cssClass: 'cancelled' },
      [EEventStatus.Other]: { label: 'Outro', cssClass: 'other' }
    };
    const statusInfo = statusMap[event.status ?? EEventStatus.Pending] || statusMap[EEventStatus.Other];

    return {
      subject: event.subject,
      horario,
      duracao,
      statusLabel: statusInfo.label,
      statusClass: statusInfo.cssClass,
      color: event.categoryColor || '#f59e0b'
    };
  }

  private processOrders(orders: { orderStatus: OrderStatus; registrationDate?: string }[]): void {
    const now = new Date();
    const seteDiasAtras = new Date(now);
    seteDiasAtras.setDate(now.getDate() - 7);
    const catorzeDiasAtras = new Date(now);
    catorzeDiasAtras.setDate(now.getDate() - 14);

    const ultimos7Dias = orders.filter(o => o.registrationDate && this.parseLocalDate(o.registrationDate) >= seteDiasAtras);
    const seteDiasAnteriores = orders.filter(o => {
      if (!o.registrationDate) return false;
      const data = this.parseLocalDate(o.registrationDate);
      return data >= catorzeDiasAtras && data < seteDiasAtras;
    });

    const taxaPeriodo = (lista: typeof orders) => {
      if (lista.length === 0) return 0;
      const cancelados = lista.filter(o => o.orderStatus === OrderStatus.Cancelled).length;
      return (cancelados / lista.length) * 100;
    };

    this.taxaCancelamento = taxaPeriodo(ultimos7Dias);
    const taxaAnterior = taxaPeriodo(seteDiasAnteriores);
    this.pontosVariacaoCancelamento = this.taxaCancelamento - taxaAnterior;
  }

  changeChartPeriod(period: string) {
    this.selectedPeriod = period;
    this.buildChart();
  }

  private buildChart(): void {
    const now = new Date();
    let points: { label: string; date: Date }[];

    if (this.selectedPeriod === '7d') {
      const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      points = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return { label: weekdayLabels[d.getDay()], date: d };
      });
    } else if (this.selectedPeriod === '90d') {
      points = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (11 - i) * 7);
        return { label: `Sem ${i + 1}`, date: d };
      });
    } else {
      points = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        return { label: `${d.getDate()}`, date: d };
      });
    }

    const values = points.map(p => this.clientes.filter(c => this.parseLocalDate(c.registrationDate) <= p.date).length);

    this.chartData = {
      labels: points.map(p => p.label),
      datasets: [
        {
          label: 'Total de clientes',
          data: values,
          borderColor: '#f59e0b',
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6b7280' }
        },
        y: {
          ticks: { color: '#6b7280' }
        }
      }
    };
  }

  goToCalendar(): void {
    this.router.navigate(['/calendar-events']);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private parseLocalDate(dateString: string): Date {
    const cleanDate = dateString.replace('Z', '').split('+')[0].split('-').slice(0, 3).join('-') +
      'T' + (dateString.split('T')[1]?.split('+')[0].split('Z')[0] ?? '00:00:00');

    const parts = cleanDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      return new Date(
        parseInt(parts[1]),
        parseInt(parts[2]) - 1,
        parseInt(parts[3]),
        parseInt(parts[4]),
        parseInt(parts[5]),
        parseInt(parts[6])
      );
    }
    return new Date(dateString);
  }
}
