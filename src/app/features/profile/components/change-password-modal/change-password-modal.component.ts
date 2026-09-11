import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfileService, ProfileData } from '../../services/profile.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() profile: ProfileData | null = null;
  @Output() closed = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  loading = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnChanges(): void {
    if (this.visible) {
      this.form.reset();
      this.showNewPassword.set(false);
      this.showConfirmPassword.set(false);
    }
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (newPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.profile) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword } = this.form.value;

    this.loading.set(true);
    this.profileService.updateOwnProfile({
      fullName: this.profile.fullName,
      email: this.profile.email,
      cpf: this.profile.cpf,
      birth: this.profile.birth,
      gender: this.profile.gender,
      address: this.profile.address,
      newPassword: newPassword!
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.successModalService.show('Senha alterada com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
        this.onCancel();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao alterar senha');
      }
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
