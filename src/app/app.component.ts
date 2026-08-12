import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal.component';
import { ErrorModalService } from './shared/components/error-modal/error-modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ErrorModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-error-modal
      [visible]="errorModalService.visible()"
      [message]="errorModalService.message()"
      (visibleChange)="errorModalService.hide()">
    </app-error-modal>
  `
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  errorModalService = inject(ErrorModalService);

  ngOnInit(): void {
  }
}
