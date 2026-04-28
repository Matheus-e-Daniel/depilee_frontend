import { Injectable, signal } from '@angular/core';

export interface SuccessModalConfig {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuccessModalService {
  visible = signal(false);
  message = signal('Operação realizada com sucesso!');

  show(config: SuccessModalConfig | string): void {
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
