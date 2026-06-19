import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommissionService } from '../../services/commission.service';
import { CalculationMode } from '../../models/commission.model';

@Component({
  selector: 'app-commission-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    DropdownModule,
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

  calculationModeOptions = [
    { label: 'Por Serviço (% cadastrado no serviço)', value: CalculationMode.ByService },
    { label: 'Por Usuário (% cadastrado no responsável)', value: CalculationMode.ByUser },
    { label: 'Global (% definido aqui)', value: CalculationMode.Global }
  ];

  get isGlobalMode(): boolean {
    return this.settingsForm?.get('calculationMode')?.value === CalculationMode.Global;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();

    this.settingsForm.get('calculationMode')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateGlobalPercentageValidator());
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      calculationMode: [null, Validators.required],
      globalCommissionPercentage: [null, [Validators.min(0), Validators.max(100)]]
    });
  }

  private loadSettings(): void {
    this.loading.set(true);
    this.commissionService.getSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => {
          this.settingsForm.patchValue({
            calculationMode: settings.calculationMode,
            globalCommissionPercentage: settings.globalCommissionPercentage ?? null
          }, { emitEvent: false });
          this.updateGlobalPercentageValidator();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  private updateGlobalPercentageValidator(): void {
    const ctrl = this.settingsForm.get('globalCommissionPercentage');
    if (this.isGlobalMode) {
      ctrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else {
      ctrl?.setValidators([Validators.min(0), Validators.max(100)]);
      ctrl?.setValue(null);
    }
    ctrl?.updateValueAndValidity();
  }

  onSave(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.settingsForm.value;

    this.commissionService.updateSettings({
      calculationMode: value.calculationMode,
      globalCommissionPercentage: this.isGlobalMode ? value.globalCommissionPercentage : null
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
