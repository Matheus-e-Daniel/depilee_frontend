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
    effect(() => {
      const permissions = this.authService.userPermissions();
    });
  }

  private checkPermission(permission: string | string[]): void {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const hasAccess = this.appHasPermissionMode === 'all'
      ? this.authService.hasAllPermissions(permissions)
      : this.authService.hasAnyPermission(permissions);

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
