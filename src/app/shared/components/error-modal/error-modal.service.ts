// src/app/shared/components/error-modal/error-modal.service.ts
import { Injectable, signal } from '@angular/core';

export interface ErrorModalConfig {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {
  visible = signal(false);
  message = signal('Ocorreu um erro!');

  show(config: ErrorModalConfig | string): void {
    if (typeof config === 'string') {
      this.message.set(config);
    } else {
      this.message.set(config.message);
    }
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }
}
