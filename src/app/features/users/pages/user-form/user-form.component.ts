import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User, Gender } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

// Constantes
const CEP_DEBOUNCE_TIME = 800;
const FOCUS_NUMBER_DELAY = 100;

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputMaskModule,
    ToastModule,
    ErrorModalComponent
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  errorModalService = inject(ErrorModalService);

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.email]],
    fullName: [''],
    password: [''],
    cpf: ['', [Validators.required]],
    birth: ['', [Validators.required, this.birthDateValidator.bind(this)]],
    gender: ['', [Validators.required]],
    address: this.fb.group({
      cep: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      complement: ['']
    })
  });

  genderOptions = [
    { label: 'Masculino', value: 1 },
    { label: 'Feminino', value: 2 },
    { label: 'Outro', value: 3 }
  ];
  loading = signal(false);
  success = signal(false);
  formSubmitted = signal(false);
  loadingCep = signal(false);
  cepErrorMessage = signal('');

  ngOnInit(): void {
    // Listener para buscar endereço quando o CEP for preenchido
    this.userForm.get('address.cep')?.valueChanges.pipe(
      debounceTime(CEP_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(cep => {
        // Limpa mensagem de erro quando o usuário começa a digitar
        this.cepErrorMessage.set('');
        const cepLimpo = cep?.replace(/\D/g, '') || '';
        return cepLimpo.length === 8;
      })
    ).subscribe(cep => {
      this.buscarCep(cep);
    });
  }

  private birthDateValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    let year: number;
    let month: number;
    let day: number;

    // Se for string no formato DD/MM/YYYY (p-inputMask)
    if (typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else {
        return null;
      }
    } else if (value instanceof Date) {
      day = value.getDate();
      month = value.getMonth() + 1;
      year = value.getFullYear();
    } else {
      return null;
    }

    // Valida mês
    if (month > 12 || month < 1) {
      return { invalidMonth: true };
    }

    // Valida dia
    if (day < 1 || day > 31) {
      return { invalidDay: true };
    }

    // Valida ano futuro
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      return { futureDate: true };
    }

    return null;
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.loading.set(true);
    const formValue = this.userForm.value;
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
      Gender: formValue.gender || 3,
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

  buscarCep(cep: string): void {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8 || this.loadingCep()) {
      return;
    }

    this.loadingCep.set(true);

    this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).subscribe({
      next: (data: any) => {
        if (data.erro) {
          this.errorModalService.show('O CEP informado não foi encontrado');
          this.cepErrorMessage.set('Por favor, digite um CEP válido');
          this.loadingCep.set(false);
          return;
        }

        const addressGroup = this.userForm.get('address') as FormGroup;
        addressGroup.patchValue({
          state: data.uf,
          city: data.localidade,
          neighborhood: data.bairro,
          street: data.logradouro,
          complement: data.complemento
        }, { emitEvent: false });

        this.loadingCep.set(false);

        setTimeout(() => {
          document.getElementById('number')?.focus();
        }, FOCUS_NUMBER_DELAY);
      },
      error: () => {
        this.errorModalService.show('Erro ao buscar CEP');
        this.cepErrorMessage.set('Por favor, digite um CEP válido');
        this.loadingCep.set(false);
      }
    });
  }

  onCepFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCepClick(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCpfFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCpfClick(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onBirthFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onBirthClick(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }
}
