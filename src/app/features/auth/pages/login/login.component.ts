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
  developmentMode = true;

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
    console.log('🔐 LoginComponent: Inicializado');
    console.log('📊 Estado inicial do AuthStore:', this.authStore.state());

    if (this.authStore.authenticated) {
      console.log('🔄 Usuário já autenticado, redirecionando...');
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      console.log('🧹 LoginComponent: Subscription limpa');
    }
  }

  onSubmit() {
    console.log('🔄 LoginComponent: onSubmit() chamado');
    console.log('📝 Estado do formulário:', this.loginForm.value);
    console.log('✅ Válido?', this.loginForm.valid);

    if (this.loginForm.invalid) {
      console.log('❌ Formulário inválido, marcando campos como tocados');
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

    console.log('🚀 Iniciando login para:', email);
    console.log('🔑 Senha length:', password?.length);

    this.authSubscription = this.authService.login(email!, password!).subscribe({
      next: (response) => {
        console.log('✅ LoginComponent: Login bem-sucedido!');
        console.log('📦 Response completo:', response);
        this.handleLoginSuccess(response, email!);
      },
      error: (err) => {
        console.error('❌ LoginComponent: Erro no login:', err);
        console.log('📊 Detalhes do erro:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        this.handleLoginError(err);
      },
      complete: () => {
        console.log('🏁 LoginComponent: Observable completo');
        this.loading = false;
      },
    });
  }

  devBypassLogin() {
    console.warn('🔓 BYPASS DE DESENVOLVIMENTO: Login automático ativado');
    console.log('📝 Estado atual do AuthStore:', this.authStore.state());

    this.loading = true;

    setTimeout(() => {
      const mockUser = {
        id: 'dev-bypass-123',
        email: 'bypass@depilee.com',
        name: 'Dev Bypass User',
        role: 'admin',
        permissions: ['read', 'write', 'admin', 'bypass']
      };

      console.log('👤 Mock user criado:', mockUser);

      this.authStore.setAuthenticated(true);
      this.authStore.setUser(mockUser);

      console.log('📊 AuthStore após bypass:', this.authStore.state());

      this.messageService.add({
        severity: 'success',
        summary: 'Bypass Development',
        detail: 'Login de desenvolvimento ativado',
        life: 3000
      });

      console.log('🔄 Redirecionando para /dashboard...');
      this.router.navigate(['/dashboard']).catch((error) => {
        console.error('❌ Erro no redirecionamento:', error);
        this.router.navigate(['/']);
      });

      this.loading = false;
    }, 800);
  }

  private handleLoginSuccess(response: any, email: string) {
    console.log('🎯 LoginComponent: handleLoginSuccess()');
    console.log('👤 Dados do usuário recebidos:', response.user);
    console.log('📦 Response completo:', response);

    this.authStore.setAuthenticated(true);
    this.authStore.setUser(response.user || { email: email });

    console.log('📊 AuthStore após login:', this.authStore.state());

    this.messageService.add({
      severity: 'success',
      summary: 'Bem-vindo',
      detail: 'Login realizado com sucesso',
      life: 3000
    });

    setTimeout(() => {
      console.log('🔄 Redirecionando para dashboard...');
      this.router.navigate(['/dashboard']).catch((error) => {
        console.error('❌ Erro no redirecionamento para dashboard:', error);
        this.router.navigate(['/']);
      });
    }, 1000);
  }

  private handleLoginError(err: any) {
    console.error('💥 LoginComponent: handleLoginError()', err);
    this.loading = false;

    const errorMessage = err?.error?.message || 'Credenciais inválidas ou servidor indisponível';
    console.log('📢 Mensagem de erro para usuário:', errorMessage);

    this.messageService.add({
      severity: 'error',
      summary: 'Erro no login',
      detail: errorMessage,
      life: 5000
    });

    console.log('🔄 Resetando campo de senha...');
    this.loginForm.get('password')?.reset();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
