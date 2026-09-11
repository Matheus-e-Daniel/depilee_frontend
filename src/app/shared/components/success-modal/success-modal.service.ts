import { Injectable, signal } from '@angular/core';

export interface SuccessModalConfig {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuccessModalService {
  visible = signal(false);
  loading = signal(false);
  message = signal('Operação realizada com sucesso!');

  /** Chamado antes de disparar a requisição — mostra o modal em estado de carregamento. */
  showLoading(): void {
    this.loading.set(true);
    this.visible.set(true);
  }

  /** Chamado quando a API responde com sucesso — troca o loader pela mensagem. */
  show(config: SuccessModalConfig | string): void {
    if (typeof config === 'string') {
      this.message.set(config);
    } else {
      this.message.set(config.message);
    }
    this.loading.set(false);
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
    this.loading.set(false);
  }
}
