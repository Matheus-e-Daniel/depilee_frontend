import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommissionService } from '../../services/commission.service';

@Component({
  selector: 'app-commission-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './commission-settings.component.html',
  styleUrls: ['./commission-settings.component.scss']
})
export class CommissionSettingsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private commissionService = inject(CommissionService);

  settingsForm!: FormGroup;
  loading = signal(false);
  saving = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      globalCommissionPercentage: [null, [Validators.min(0), Validators.max(100)]]
    });
  }

  private loadSettings(): void {
    this.loading.set(true);
    this.commissionService.getSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data: settings }) => {
          this.settingsForm.patchValue({
            globalCommissionPercentage: settings.globalCommissionPercentage ?? null
          }, { emitEvent: false });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  onSave(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.settingsForm.value;

    this.commissionService.updateSettings({
      globalCommissionPercentage: value.globalCommissionPercentage
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
