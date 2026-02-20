// src/app/shared/directives/has-permission.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input() set appHasPermission(permission: string | string[]) {
    this.checkPermission(permission);
  }

  @Input() appHasPermissionMode: 'any' | 'all' = 'any';

  constructor() {
    // Reage a mudanças nas permissões
    effect(() => {
      const permissions = this.authService.userPermissions();
      // Força reavaliação quando permissões mudam
    });
  }

  private checkPermission(permission: string | string[]): void {
    const permissions = Array.isArray(permission) ? permission : [permission];
    console.log(`🔐 [Diretiva] Verificando permissão(ões):`, permissions, `(modo: ${this.appHasPermissionMode})`);

    let hasAccess = false;

    if (this.appHasPermissionMode === 'all') {
      hasAccess = this.authService.hasAllPermissions(permissions);
    } else {
      hasAccess = this.authService.hasAnyPermission(permissions);
    }

    console.log(`🔐 [Diretiva] Resultado:`, hasAccess ? '✅ Elemento VISÍVEL' : '❌ Elemento OCULTO');

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
