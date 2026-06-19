import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CommissionService } from '../../services/commission.service';
import { CommissionResult, CalculationMode } from '../../models/commission.model';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/models/user.model';

@Component({
  selector: 'app-commission-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    TableModule,
    CalendarModule
  ],
  templateUrl: './commission-history.component.html',
  styleUrls: ['./commission-history.component.scss']
})
export class CommissionHistoryComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private commissionService = inject(CommissionService);
  private userService = inject(UserService);

  users = signal<User[]>([]);
  selectedUserId = signal<number | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  result = signal<CommissionResult | null>(null);
  usersLoading = signal(true);
  loading = signal(false);

  userOptions: { label: string; value: number }[] = [];

  readonly CalculationMode = CalculationMode;

  calculationModeLabel(mode: CalculationMode): string {
    const labels: Record<CalculationMode, string> = {
      [CalculationMode.ByService]: 'Por Serviço',
      [CalculationMode.ByUser]: 'Por Usuário',
      [CalculationMode.Global]: 'Global'
    };
    return labels[mode] ?? String(mode);
  }

  ngOnInit(): void {
    this.userService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.userOptions = users.map(u => ({
            label: (u as any).fullName || (u as any).name || u.email,
            value: (u as any).id
          }));
          this.usersLoading.set(false);
        },
        error: () => {
          this.usersLoading.set(false);
        }
      });
  }

  search(): void {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.loading.set(true);
    this.result.set(null);

    const startDate = this.startDate() ? this.formatDate(this.startDate()!) : undefined;
    const endDate = this.endDate() ? this.formatDate(this.endDate()!) : undefined;

    this.commissionService.getByUser(userId, startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  clearFilters(): void {
    this.startDate.set(null);
    this.endDate.set(null);
    this.result.set(null);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
