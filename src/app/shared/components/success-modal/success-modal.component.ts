// src/app/shared/components/success-modal/success-modal.component.ts
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
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
export class SuccessModalComponent {
  @Input() message: string = 'Operação realizada com sucesso!';
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  showLoader = signal(true);
  showSuccess = signal(false);

  ngOnChanges(): void {
    if (this.visible) {
      this.showModal();
    }
  }

  private showModal(): void {
    this.showLoader.set(true);
    this.showSuccess.set(false);

    // Após 1000ms, transforma o loader em check
    setTimeout(() => {
      this.showLoader.set(false);
      this.showSuccess.set(true);

      // Após 1500ms, fecha o modal automaticamente
      setTimeout(() => {
        this.close();
      }, 1500);
    }, 1000);
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
