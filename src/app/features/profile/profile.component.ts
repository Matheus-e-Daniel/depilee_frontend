import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfileService, ProfileData } from './services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { SuccessModalComponent } from '../../shared/components/success-modal/success-modal.component';
import { ErrorModalService } from '../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../shared/components/success-modal/success-modal.service';
import { ChangePasswordModalComponent } from './components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    SuccessModalComponent,
    ChangePasswordModalComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  profile = signal<ProfileData | null>(null);
  loading = signal(false);
  saving = signal(false);
  editing = signal(false);
  showChangePassword = signal(false);

  profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getOwnProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao carregar perfil');
        this.loading.set(false);
      }
    });
  }

  startEditing(): void {
    const current = this.profile();
    this.profileForm.patchValue({
      fullName: current?.fullName ?? '',
      email: current?.email ?? ''
    });
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, email } = this.profileForm.value;

    this.saving.set(true);
    this.profileService.updateOwnProfile({ fullName: fullName!, email: email! }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.profile.update(p => p && { ...p, fullName: fullName!, email: email! });

        const userData = this.authService.getUserData();
        if (userData) {
          this.authService.setUserData({ ...userData, email: email!, userName: email! });
        }

        this.successModalService.show('Perfil atualizado com sucesso!');
        setTimeout(() => this.successModalService.hide(), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao atualizar perfil');
      }
    });
  }

  openChangePassword(): void {
    this.showChangePassword.set(true);
  }

  closeChangePassword(): void {
    this.showChangePassword.set(false);
  }
}
