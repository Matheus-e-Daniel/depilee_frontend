// src/app/features/clients/pages/client-list/client-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

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
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  clients = signal<Client[]>([]);
  loading = signal(true);

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
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir "${name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.clientService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente excluído'
            });
            this.loadClients();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao excluir cliente'
            });
          }
        });
      }
    });
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
