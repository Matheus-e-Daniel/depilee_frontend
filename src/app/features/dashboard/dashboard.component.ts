import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  loading = signal(true);

  // Cards
  totalClientes = 0;
  crescimentoClientes = '0%';

  valorCaixa = 0;
  crescimentoCaixa = '0%';

  agendamentosHoje = 0;
  variacaoAgendamentos = 0.12;

  cancelamentos = 0;
  variacaoCancelamentos = '-10%';

  // Chart
  selectedPeriod = '30d';
  chartPeriods = [
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
    { label: '90 dias', value: '90d' }
  ];

  chartData: any;
  chartOptions: any;

  proximosAgendamentos: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    setTimeout(() => {
      this.totalClientes = 1480;
      this.crescimentoClientes = '+14%';

      this.valorCaixa = 50250.35;
      this.crescimentoCaixa = '+10%';

      this.agendamentosHoje = 42;
      this.cancelamentos = 6;

      this.proximosAgendamentos = [
        { cliente: 'Carla Mendes', servico: 'Consulta Geral', horario: '09:20', status: 'Confirmado' },
        { cliente: 'Ana Souza', servico: 'Nutricionista', horario: '10:40', status: 'Atrasado' },
        { cliente: 'Mariana Dias', servico: 'Retorno', horario: '13:00', status: 'Em Andamento' },
        { cliente: 'Patrícia Lima', servico: 'Psicologia', horario: '15:30', status: 'Cancelado' },
      ];

      this.buildChart();
      this.loading.set(false);
    }, 900);
  }

  refreshData() {
    this.loadData();
  }

  changeChartPeriod(period: string) {
    this.selectedPeriod = period;
    this.buildChart();
  }

  buildChart() {
    const labels = {
      '7d': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      '30d': Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      '90d': Array.from({ length: 12 }, (_, i) => `Sem ${i + 1}`),
    }[this.selectedPeriod] || ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const values = labels.map(() => Math.floor(Math.random() * 50) + 20);

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Clientes',
          data: values,
          borderColor: '#3B82F6',
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

  getStatusSeverity(status: string):
  'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {

  return ({
    'Confirmado': 'success',
    'Atrasado': 'warning',
    'Em Andamento': 'info',
    'Cancelado': 'danger'
  } as { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined })[status] ?? 'secondary';
}

}
