import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
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
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DropdownModule,
    ConfirmationModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private serviceService = inject(ServiceService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  allServices = signal<Service[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  sortOrder = signal<string>('newest');

  sortOptions = [
    { label: 'Mais recente', value: 'newest' },
    { label: 'Mais antigo', value: 'oldest' },
    { label: 'Ordem alfabética (A-Z)', value: 'alphabetical' },
    { label: 'Status (Ativo primeiro)', value: 'status' }
  ];

  services = computed(() => {
    let filtered = this.allServices();
    const searchFilter = this.searchTerm().toLowerCase().trim();
    if (searchFilter) {
      filtered = filtered.filter(service => {
        const nameMatch = service.name?.toLowerCase().startsWith(searchFilter);
        const categoryMatch = (service.categoryName || '').toLowerCase().startsWith(searchFilter);
        return nameMatch || categoryMatch;
      });
    }
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
        sorted.sort((a, b) => {
          const aStatus = Number((a as any).status);
          const bStatus = Number((b as any).status);
          if (aStatus === bStatus) {
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          }
          return aStatus === 1 ? -1 : 1;
        });
        break;
    }
    return sorted;
  });

  serviceToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.serviceService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.allServices.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.sortOrder.set('newest');
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
    this.serviceService.delete(this.serviceToDelete.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
