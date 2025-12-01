// src/app/features/services/pages/service-list/service-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  services = signal<Service[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.services.set(services);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar serviços'
        });
        this.loading.set(false);
      }
    });
  }

  editService(id: string): void {
    this.router.navigate(['/services/edit', id]);
  }

  deleteService(id: string, name: string): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir "${name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.serviceService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Serviço excluído'
            });
            this.loadServices();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao excluir serviço'
            });
          }
        });
      }
    });
  }

  newService(): void {
    this.router.navigate(['/services/new']);
  }
}
