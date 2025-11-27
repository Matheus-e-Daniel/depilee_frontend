// src/app/features/auth/guards/dev.guard.ts
import { CanActivateFn } from '@angular/router';

export const devGuard: CanActivateFn = () => {
  console.log('🔓 DEV MODE: Acesso liberado sem autenticação');
  return true; // Sempre permite acesso
};
