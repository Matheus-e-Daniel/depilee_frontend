// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
    RippleModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitted = false;


  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials = this.loginForm.value as { email: string; password: string };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          console.log('✅ Login bem-sucedido:', response);
          console.log('👤 Dados do usuário:', response?.data);
          console.log('🎭 Roles do usuário:', response?.data?.roles);

          // ATUALIZA O ESTADO PARA TRUE
          this.authService.setAuthenticated(true);

          // Salva usuário e permissões
          if (response?.data) {
            this.authService.setUserData(response.data);
          }

          // REDIRECIONA DIRETAMENTE para dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.authService.setAuthenticated(false);

          if (error.status === 0) {
            this.errorMessage.set('Servidor indisponível');
          } else if (error.status === 401) {
            this.errorMessage.set('Email ou senha incorretos');
          } else {
            this.errorMessage.set('Erro ao fazer login');
          }
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
