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
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.7)' }))
      ])
    ]),
    trigger('checkAnimation', [
      state('hidden', style({ opacity: 0, transform: 'scale(0)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', [
        animate('400ms 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ])
    ])
  ]
})
export class SuccessModalComponent {
  @Input() message: string = 'Operação realizada com sucesso!';
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  showLoader = signal(true);
  showCheck = signal(false);
  checkState = 'hidden';

  ngOnChanges(): void {
    if (this.visible) {
      this.showModal();
    }
  }

  private showModal(): void {
    this.showLoader.set(true);
    this.showCheck.set(false);
    this.checkState = 'hidden';

    // Após 800ms, esconde o loader e mostra o check
    setTimeout(() => {
      this.showLoader.set(false);
      this.showCheck.set(true);
      this.checkState = 'visible';

      // Após 1500ms, fecha o modal automaticamente
      setTimeout(() => {
        this.close();
      }, 1500);
    }, 800);
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
