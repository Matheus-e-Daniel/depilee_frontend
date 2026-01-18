import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ClientService } from '../../services/client.service';

// Constantes
const CEP_DEBOUNCE_TIME = 800;
const FOCUS_NUMBER_DELAY = 100;
const CLIENT_DATA_LOAD_DELAY = 1000;
const SUCCESS_REDIRECT_DELAY = 2500;
import { ClientFormData } from '../../models/client.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { ErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    SuccessModalComponent,
    ConfirmationModalComponent,
    ErrorModalComponent
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  successModalService = inject(SuccessModalService);
  errorModalService = inject(ErrorModalService);

  clientForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  clientId = signal<string | null>(null);
  maxDate: Date = new Date();
  loadingCep = signal(false);
  isLoadingClientData = signal(false);
  originalFormValue: any = null;
  formModified = signal(false);
  cepErrorMessage = signal('');
  formSubmitted = signal(false);

  // Modals
  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  genderOptions = [
    { label: 'Masculino', value: 1 },
    { label: 'Feminino', value: 2 },
    { label: 'Outro', value: 3 }
  ];

  states = [
    { label: 'Acre', value: 'AC' },
    { label: 'Alagoas', value: 'AL' },
    { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' },
    { label: 'Mato Grosso', value: 'MT' },
    { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Pará', value: 'PA' },
    { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Pernambuco', value: 'PE' },
    { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Rio Grande do Norte', value: 'RN' },
    { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' },
    { label: 'Roraima', value: 'RR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' },
    { label: 'Sergipe', value: 'SE' },
    { label: 'Tocantins', value: 'TO' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      gender: [''],
      cpf: [''],
      phone: [''],
      email: [''],
      birth: ['', [Validators.required, this.birthDateValidator]],
      cep: [''],
      state: [''],
      city: [''],
      neighborhood: [''],
      street: [''],
      number: [''],
      complement: [''],
      active: [true]
    });

    // Listener para buscar endereço quando o CEP for preenchido
    this.clientForm.get('cep')?.valueChanges.pipe(
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

    // Listener para detectar mudanças no formulário
    this.clientForm.valueChanges.subscribe(() => {
      this.checkFormModified();
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

    // Se for string no formato DD/MM/YYYY
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

  private checkFormModified(): void {
    if (!this.isEditMode() || !this.originalFormValue) {
      this.formModified.set(true);
      return;
    }

    const currentValue = this.clientForm.value;
    const hasChanges = JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
    this.formModified.set(hasChanges);
  }

  buscarCep(cep: string): void {
    const cepLimpo = cep.replace(/\D/g, '');

    if (this.isLoadingClientData()) {
      return;
    }

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

        this.clientForm.patchValue({
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

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.clientId.set(id);
      this.loadClient(id);
    }
  }

  private loadClient(id: string): void {
    this.loading.set(true);
    this.isLoadingClientData.set(true);

    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          name: client.name,
          gender: client.gender,
          cpf: client.cpf,
          phone: client.phone,
          email: client.email,
          birth: this.formatDateToDDMMYYYY(client.birth),
          cep: client.address.cep,
          state: client.address.state,
          city: client.address.city,
          neighborhood: client.address.neighborhood,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement
        });

        // Armazenar valores originais para comparação
        this.originalFormValue = { ...this.clientForm.value };
        this.formModified.set(false);

        this.loading.set(false);

        setTimeout(() => {
          this.isLoadingClientData.set(false);
        }, CLIENT_DATA_LOAD_DELAY);
      },
      error: () => {
        this.errorModalService.show('Falha ao carregar cliente');
        this.isLoadingClientData.set(false);
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 2000);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.clientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);

    const formValue = this.clientForm.value;

    const formData: ClientFormData = {
      name: formValue.name,
      gender: formValue.gender || 3,
      cpf: formValue.cpf.replace(/\D/g, ''),
      phone: formValue.phone,
      email: formValue.email,
      birth: this.formatDateToISO(formValue.birth),
      address: {
        cep: formValue.cep,
        state: formValue.state,
        city: formValue.city,
        neighborhood: formValue.neighborhood,
        street: formValue.street,
        number: formValue.number,
        complement: formValue.complement || undefined
      }
    };

    const payload = this.isEditMode()
      ? { id: parseInt(this.clientId()!), ...formData }
      : formData;

    const operation = this.isEditMode()
      ? this.clientService.update(payload)
      : this.clientService.create(formData);

    operation.subscribe({
      next: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Cliente atualizado com sucesso!'
            : 'Cliente criado com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/clients']);
        }, SUCCESS_REDIRECT_DELAY);
      },
      error: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.errorModalService.show('Falha ao salvar cliente');
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }

  private formatDateToISO(date: Date | string | null): string {
    if (!date) {
      return '';
    }

    // Se for uma string no formato DD/MM/YYYY (vindo do InputMask)
    if (typeof date === 'string') {
      // Verifica se está no formato DD/MM/YYYY
      const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = date.match(ddmmyyyyPattern);

      if (match) {
        const [, day, month, year] = match;
        const isoDate = `${year}-${month}-${day}T00:00:00`;
        return isoDate;
      }

      // Se já estiver em formato ISO ou outro formato, retorna como está
      return date;
    }

    // Se for um objeto Date válido
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split('.')[0];
    }

    return '';
  }

  private formatDateToDDMMYYYY(date: string | Date | null): string {
    if (!date) {
      return '';
    }

    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Formata para DD/MM/YYYY
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private markFormGroupTouched(): void {
    Object.values(this.clientForm.controls).forEach(control => {
      control.markAsTouched();
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

  onPhoneFocus(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onPhoneClick(event: any): void {
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
