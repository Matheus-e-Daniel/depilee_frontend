// dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    ButtonModule,
    ListboxModule,
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  loading = signal(false);

  // Dados dos cards
  totalClientes = 1248;
  crescimentoClientes = '+12%';
  valorCaixa = 24568.90;
  crescimentoCaixa = '+8%';
  agendamentosHoje = 17;
  variacaoAgendamentos = 0.05;
  cancelamentos = 3;
  variacaoCancelamentos = '-2%';

  // Gráfico
  chartData: any;
  chartOptions: any;
  selectedPeriod = 'month';
  chartPeriods = [
    { label: 'Mensal', value: 'month' },
    { label: 'Trimestral', value: 'quarter' },
    { label: 'Anual', value: 'year' }
  ];

  // Lista de agendamentos
  proximosAgendamentos = [
    { cliente: 'Maria Silva', servico: 'Corte Feminino', horario: '14:30', status: 'Confirmado' },
    { cliente: 'João Santos', servico: 'Barba', horario: '15:00', status: 'Confirmado' },
    { cliente: 'Ana Costa', servico: 'Coloração', horario: '15:30', status: 'Pendente' },
    { cliente: 'Pedro Oliveira', servico: 'Corte Masculino', horario: '16:00', status: 'Confirmado' }
  ];

  ngOnInit() {
    this.initChart();
    this.simulateLoading();
    // Calendário removido: não há mais inicialização de dateRange
  }

  private simulateLoading() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1500);
  }

  private initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Novos Clientes',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: true,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: 'Clientes Ativos',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: true,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: surfaceBorder,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    };
  }

  changeChartPeriod(period: string) {
    this.selectedPeriod = period;
    console.log('Período alterado para:', period);
  }

  refreshData() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      // Simular atualização de dados
      this.totalClientes += Math.floor(Math.random() * 10);
      this.agendamentosHoje = Math.floor(Math.random() * 10) + 15;
    }, 1000);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Confirmado':
        return 'success';
      case 'Pendente':
        return 'warning';
      case 'Cancelado':
        return 'danger';
      default:
        return 'info';
    }
  }
}
