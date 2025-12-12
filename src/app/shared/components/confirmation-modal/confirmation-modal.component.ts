// src/app/shared/components/confirmation-modal/confirmation-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';

export type ConfirmationType = 'delete' | 'update' | 'create' | 'warning';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  animations: [
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.7)' }))
      ])
    ])
  ]
})
export class ConfirmationModalComponent {
  @Input() visible: boolean = false;
  @Input() type: ConfirmationType = 'delete';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmLabel: string = 'Confirmar';
  @Input() cancelLabel: string = 'Cancelar';
  @Input() loading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  getIcon(): string {
    switch (this.type) {
      case 'delete':
        return 'pi-trash';
      case 'update':
        return 'pi-pencil';
      case 'create':
        return 'pi-plus';
      case 'warning':
        return 'pi-exclamation-triangle';
      default:
        return 'pi-question';
    }
  }

  getIconColor(): string {
    switch (this.type) {
      case 'delete':
        return '#ef4444';
      case 'update':
        return '#3b82f6';
      case 'create':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  getTitle(): string {
    if (this.title) return this.title;

    switch (this.type) {
      case 'delete':
        return 'Confirmar Exclusão';
      case 'update':
        return 'Confirmar Atualização';
      case 'create':
        return 'Confirmar Cadastro';
      case 'warning':
        return 'Atenção';
      default:
        return 'Confirmação';
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCancel();
    }
  }
}
