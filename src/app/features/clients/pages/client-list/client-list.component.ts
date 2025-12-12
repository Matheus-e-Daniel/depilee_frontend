// src/app/features/clients/pages/client-list/client-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-client-list',
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
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  clients = signal<Client[]>([]);
  loading = signal(true);

  // Delete confirmation
  clientToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar clientes'
        });
        this.loading.set(false);
      }
    });
  }

  editClient(id: string): void {
    this.router.navigate(['/clients/edit', id]);
  }

  deleteClient(id: string, name: string): void {
    this.clientToDelete = { id, name };
  }

  getDeleteMessage(): string {
    return this.clientToDelete ? `Tem certeza que deseja excluir "${this.clientToDelete.name}"?` : '';
  }

  confirmDelete(): void {
    if (!this.clientToDelete) return;

    this.confirmationLoading.set(true);
    this.clientService.delete(this.clientToDelete.id).subscribe({
      next: () => {
        this.clientToDelete = null;
        this.confirmationLoading.set(false);
        this.successModalService.show('Cliente excluído com sucesso!');

        setTimeout(() => {
          this.successModalService.hide();
        }, 2500);

        this.loadClients();
      },
      error: () => {
        this.clientToDelete = null;
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir cliente'
        });
      }
    });
  }

  cancelDelete(): void {
    this.clientToDelete = null;
  }

  newClient(): void {
    this.router.navigate(['/clients/new']);
  }

  getGenderLabel(gender: 'M' | 'F' | 'O'): string {
    const labels = { 'M': 'Masculino', 'F': 'Feminino', 'O': 'Outro' };
    return labels[gender];
  }

  formatPhone(phone: string): string {
    // Formatação básica: (11) 99999-9999
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0,2)}) ${cleaned.substring(2,7)}-${cleaned.substring(7)}`;
    }
    return phone;
  }

  formatCPF(cpf: string): string {
    // Formatação: 000.000.000-00
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0,3)}.${cleaned.substring(3,6)}.${cleaned.substring(6,9)}-${cleaned.substring(9)}`;
    }
    return cpf;
  }
}
