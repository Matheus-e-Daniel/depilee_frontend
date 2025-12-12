// src/app/features/services/pages/service-list/service-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

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
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  providers: [MessageService],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  services = signal<Service[]>([]);
  loading = signal(true);

  // Delete confirmation
  serviceToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

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
    this.serviceToDelete = { id, name };
  }

  getDeleteMessage(): string {
    return this.serviceToDelete ? `Tem certeza que deseja excluir "${this.serviceToDelete.name}"?` : '';
  }

  confirmDelete(): void {
    if (!this.serviceToDelete) return;

    this.confirmationLoading.set(true);
    this.serviceService.delete(this.serviceToDelete.id).subscribe({
      next: () => {
        this.serviceToDelete = null;
        this.confirmationLoading.set(false);
        this.successModalService.show('Serviço excluído com sucesso!');

        setTimeout(() => {
          this.successModalService.hide();
        }, 2500);

        this.loadServices();
      },
      error: () => {
        this.serviceToDelete = null;
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir serviço'
        });
      }
    });
  }

  cancelDelete(): void {
    this.serviceToDelete = null;
  }

  newService(): void {
    this.router.navigate(['/services/new']);
  }
}
