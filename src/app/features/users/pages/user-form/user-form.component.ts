import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User, Gender } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.email]],
    fullName: [''],
    password: [''],
    cpf: [''],
    birth: [''],
    gender: [''],
    address: this.fb.group({
      cep: [''],
      state: [''],
      city: [''],
      street: [''],
      number: [''],
      neighborhood: [''],
      complement: ['']
    })
  });

  genders = Object.values(Gender);
  loading = signal(false);
  success = signal(false);

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.loading.set(true);
    const formValue = this.userForm.value;
    // Mapear gender string para número
    const genderMap: Record<string, number> = { 'Other': 0, 'Male': 1, 'Female': 2 };
    // Mapear address para propriedades com maiúscula
    const address = formValue.address;
    const mappedAddress = {
      Cep: address.cep,
      State: address.state,
      City: address.city,
      Neighborhood: address.neighborhood,
      Street: address.street,
      Number: address.number,
      Complement: address.complement
    };
    // Montar objeto final
    const userPayload = {
      Email: formValue.email,
      FullName: formValue.fullName,
      Password: formValue.password,
      Cpf: formValue.cpf,
      Birth: formValue.birth ? new Date(formValue.birth).toISOString() : null,
      Gender: genderMap[formValue.gender] ?? 0,
      Address: mappedAddress
    };
    this.userService.create(userPayload).subscribe({
      next: (response) => {
        console.log('[UserFormComponent][create] Resposta recebida:', response);
        this.success.set(true);
        this.userForm.reset();
        this.loading.set(false);
        setTimeout(() => this.success.set(false), 2000);
      },
      error: (err) => {
        console.log('[UserFormComponent][create] Erro recebido:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao cadastrar usuário'
        });
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  private markFormGroupTouched(): void {
    Object.values(this.userForm.controls).forEach(control => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(c => c.markAsTouched());
      } else {
        control.markAsTouched();
      }
    });
  }
}
