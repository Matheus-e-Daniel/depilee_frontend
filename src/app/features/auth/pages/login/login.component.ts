import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

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
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private messageService = inject(MessageService);

  private authSubscription?: Subscription;

  currentYear = new Date().getFullYear();
  developmentMode = true; // 👈 Controle do modo desenvolvimento

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

  ngOnInit() {
    if (this.authStore.authenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulário inválido',
        detail: 'Por favor, preencha todos os campos corretamente',
      });
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authSubscription = this.authService.login(email!, password!).subscribe({
      next: (response) => {
        this.handleLoginSuccess(response, email!);
      },
      error: (err) => {
        this.handleLoginError(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // 🔓 NOVO MÉTODO: BYPASS DE DESENVOLVIMENTO
  devBypassLogin() {
    console.warn('🔓 BYPASS DE DESENVOLVIMENTO: Login automático');

    this.loading = true;

    // Simula delay de rede
    setTimeout(() => {
      const mockUser = {
        id: 'dev-bypass-123',
        email: 'admin@system.local',
        name: 'P@$$w0rd!',
        role: 'admin',
        permissions: ['read', 'write', 'admin', 'bypass']
      };

      this.authStore.setAuthenticated(true);
      this.authStore.setUser(mockUser);

      this.messageService.add({
        severity: 'success',
        summary: 'Bypass Development',
        detail: 'Login de desenvolvimento ativado',
        life: 3000
      });

      this.router.navigate(['/dashboard']).catch(() => {
        this.router.navigate(['/']);
      });

      this.loading = false;
    }, 800);
  }

  private handleLoginSuccess(response: any, email: string) {
    this.authStore.setAuthenticated(true);
    this.authStore.setUser(response.user || { email: email });

    this.messageService.add({
      severity: 'success',
      summary: 'Bem-vindo',
      detail: 'Login realizado com sucesso',
      life: 3000
    });

    setTimeout(() => {
      this.router.navigate(['/dashboard']).catch(() => {
        this.router.navigate(['/']);
      });
    }, 1000);
  }

  private handleLoginError(err: any) {
    this.loading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Erro no login',
      detail: err?.error?.message || 'Credenciais inválidas ou servidor indisponível',
      life: 5000
    });

    this.loginForm.get('password')?.reset();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
