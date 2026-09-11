import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { AuthService } from '../../../../core/services/auth.service';
import { CommissionSettingsComponent } from '../commission-settings/commission-settings.component';
import { CommissionApplyComponent } from '../commission-apply/commission-apply.component';
import { CommissionHistoryComponent } from '../commission-history/commission-history.component';

@Component({
  selector: 'app-commissions',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    CommissionSettingsComponent,
    CommissionApplyComponent,
    CommissionHistoryComponent
  ],
  templateUrl: './commissions.component.html',
  styleUrls: ['./commissions.component.scss']
})
export class CommissionsComponent {
  private authService = inject(AuthService);

  canViewSettings = this.authService.hasAnyPermission(['Commission.Get', 'Commission.Edit']);
  canApply = this.authService.hasAnyPermission(['Commission.Create']);
  canViewHistory = this.authService.hasAnyPermission(['Commission.Get']);
}
