import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
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
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)' }))
      ])
    ])
  ]
})
export class ErrorModalComponent {
  @Input() message: string = 'Ocorreu um erro!';
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
