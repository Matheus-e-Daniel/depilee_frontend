import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProfileService } from './services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ErrorModalComponent } from '../../shared/components/error-modal/error-modal.component';
import { SuccessModalComponent } from '../../shared/components/success-modal/success-modal.component';
import { ErrorModalService } from '../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../shared/components/success-modal/success-modal.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ErrorModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    newPassword: [''],
    confirmPassword: ['']
  }, { validators: this.passwordMatchValidator });

  loading = signal(false);
  formSubmitted = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getOwnProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorModalService.show('Falha ao carregar perfil');
        this.loading.set(false);
      }
    });
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
    this.formSubmitted.set(true);

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, email, newPassword } = this.profileForm.value;

    const payload: any = {
      fullName: fullName!,
      email: email!
    };

    if (newPassword) {
      payload.newPassword = newPassword;
    }

    this.loading.set(true);
    this.profileService.updateOwnProfile(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        const userData = this.authService.getUserData();
        if (userData) {
          this.authService.setUserData({ ...userData, email: email!, userName: email! });
        }
        this.profileForm.patchValue({ newPassword: '', confirmPassword: '' });
        this.formSubmitted.set(false);
        this.successModalService.show('Perfil atualizado com sucesso!');
        setTimeout(() => this.successModalService.hide(), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error?.[0]?.description || 'Falha ao atualizar perfil';
        this.errorModalService.show(msg);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
