import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmationModalComponent,
    SuccessModalComponent,
  ],
  providers: [MessageService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);

  users = signal<User[]>([]);
  loading = signal(true);

  userToDelete: { id: string; name: string } | null = null;
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (response: any) => {
        console.log('[UserListComponent][loadUsers] Dados recebidos da API:', response);
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar usuários'
        });
        this.loading.set(false);
      }
    });
  }

  newUser(): void {
    this.router.navigate(['/users/new']);
  }

  editUser(id: string): void {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: string, name: string): void {
    this.userToDelete = { id, name };
  }

  getDeleteMessage(): string {
    return this.userToDelete ? `Tem certeza que deseja excluir "${this.userToDelete.name}"?` : '';
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.confirmationLoading.set(true);
    this.userService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.userToDelete = null;
        this.confirmationLoading.set(false);
        this.successModalService.show('Usuário excluído com sucesso!');

        setTimeout(() => {
          this.successModalService.hide();
        }, 2500);

        this.loadUsers();
      },
      error: () => {
        this.userToDelete = null;
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir usuário'
        });
      }
    });
  }

  cancelDelete(): void {
    this.userToDelete = null;
  }
}
