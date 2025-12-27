// src/app/features/clients/pages/client-list/client-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
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
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
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

  allClients = signal<Client[]>([]);
  loading = signal(true);

  // Filtros
  searchTerm = signal('');
  sortOrder = signal<string>('newest');

  sortOptions = [
    { label: 'Mais recente', value: 'newest' },
    { label: 'Mais antigo', value: 'oldest' },
    { label: 'Ordem alfabética (A-Z)', value: 'alphabetical' },
    { label: 'Status (Ativo primeiro)', value: 'status' }
  ];

  // Clientes filtrados e ordenados
  clients = computed(() => {
    let filtered = this.allClients();

    // Filtro por nome (case insensitive) ou CPF (ignorando máscara)
    const searchFilter = this.searchTerm().toLowerCase().trim();
    if (searchFilter) {
      filtered = filtered.filter(client => {
        // Nome: começa com o termo buscado
        const nameMatch = client.name?.toLowerCase().startsWith(searchFilter);
        // CPF (remove máscara do input e do dado)
        const onlyNumbers = (str: string) => str ? str.replace(/\D/g, '') : '';
        const searchNumbers = onlyNumbers(searchFilter);
        const cpfMatch = searchNumbers.length > 0 && onlyNumbers(client.cpf).startsWith(searchNumbers);
        return nameMatch || cpfMatch;
      });
    }

    // Ordenação
    const sorted = [...filtered];
    switch (this.sortOrder()) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        break;
      case 'status':
        // Ativos primeiro, depois inativos, e dentro de cada grupo, ordem alfabética
        sorted.sort((a, b) => {
          if (a.active === b.active) {
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          }
          return a.active ? -1 : 1;
        });
        break;
    }

    return sorted;
  });

  // Delete confirmation
  clientToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.allClients.set(response.data);
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

  clearFilters(): void {
    this.searchTerm.set('');
    this.sortOrder.set('newest');
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

  getGenderLabel(gender: number): string {
    const labels: { [key: number]: string } = {
      1: 'Masculino',
      2: 'Feminino',
      3: 'Outro'
    };
    return labels[gender] || 'Não informado';
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
