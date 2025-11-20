import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    CardModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private messageService = inject(MessageService);

  currentYear = new Date().getFullYear();

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
      ],
    ],
  });

  loading = false;

  constructor() {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: (res) => {
        this.authStore.setAuthenticated(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Bem-vindo',
          detail: 'Login realizado com sucesso',
        });
        this.router.navigate(['/dashboard']).catch(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.message || 'Credenciais inválidas',
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
