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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ClientService } from '../../services/client.service';
import { ClientFormData } from '../../models/client.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

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
    ToastModule,
    CheckboxModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  providers: [MessageService],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  successModalService = inject(SuccessModalService);

  clientForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  clientId = signal<string | null>(null);
  maxDate: Date = new Date();
  loadingCep = signal(false);
  isLoadingClientData = false; // Flag para indicar se está carregando dados do cliente

  // Confirmation modal
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
      name: ['', [Validators.minLength(3)]],
      gender: [''],
      cpf: ['', [Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      phone: [''],
      email: ['', [Validators.email]],
      birth: [''],
      cep: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]],
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
      debounceTime(800),
      distinctUntilChanged(),
      filter(cep => cep && cep.length === 9)
    ).subscribe(cep => {
      this.buscarCep(cep);
    });
  }

  buscarCep(cep: string): void {
    const cepLimpo = cep.replace(/\D/g, '');
    console.log('🔍 CEP digitado:', cep);
    console.log('🔍 CEP limpo:', cepLimpo);

    // Se está carregando dados do cliente, não busca CEP automaticamente
    if (this.isLoadingClientData) {
      console.log('⏭️ Pulando busca de CEP - carregando dados do cliente');
      return;
    }

    if (cepLimpo.length !== 8 || this.loadingCep()) {
      console.log('❌ CEP inválido ou já carregando:', {
        comprimento: cepLimpo.length,
        jaCarregando: this.loadingCep()
      });
      return;
    }

    this.loadingCep.set(true);
    this.clientForm.get('cep')?.disable();
    console.log('📡 Buscando CEP na API ViaCEP...');

    this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).subscribe({
      next: (data: any) => {
        console.log('✅ Resposta da API ViaCEP:', data);

        if (data.erro) {
          console.log('⚠️ CEP não encontrado na base do ViaCEP');
          this.messageService.add({
            severity: 'warn',
            summary: 'CEP não encontrado',
            detail: 'O CEP informado não foi encontrado'
          });
          this.loadingCep.set(false);
          this.clientForm.get('cep')?.enable();
          return;
        }

        console.log('📝 Preenchendo campos com os dados:', {
          uf: data.uf,
          cidade: data.localidade,
          bairro: data.bairro,
          logradouro: data.logradouro,
          complemento: data.complemento
        });

        // Preencher os campos automaticamente
        this.clientForm.patchValue({
          state: data.uf,
          city: data.localidade,
          neighborhood: data.bairro,
          street: data.logradouro,
          complement: data.complemento
        }, { emitEvent: false });

        this.loadingCep.set(false);
        this.clientForm.get('cep')?.enable();
        console.log('✅ Campos preenchidos com sucesso');

        // Focar no campo número
        setTimeout(() => {
          document.getElementById('number')?.focus();
        }, 100);
      },
      error: (error) => {
        console.error('❌ Erro ao buscar CEP:', error);
        console.error('❌ Status do erro:', error.status);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Erro completo:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar CEP'
        });
        this.loadingCep.set(false);
        this.clientForm.get('cep')?.enable();
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
    this.isLoadingClientData = true; // Bloqueia busca automática de CEP

    this.clientService.getById(id).subscribe({
      next: (client) => {
        console.log('📋 Cliente carregado:', client);
        console.log('📅 Data de nascimento do backend:', client.birth);

        // Formatar dados para o formulário
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

        console.log('📅 Data formatada para o formulário:', this.clientForm.get('birth')?.value);
        this.loading.set(false);

        // Libera busca de CEP após carregar os dados
        setTimeout(() => {
          this.isLoadingClientData = false;
          console.log('✅ Busca de CEP liberada - usuário pode editar o CEP agora');
        }, 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar cliente'
        });
        this.isLoadingClientData = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);

    const formValue = this.clientForm.value;
    console.log('📋 Valores do formulário:', formValue);
    console.log('📅 Valor da data de nascimento:', formValue.birth, typeof formValue.birth);

    const formData: ClientFormData = {
      name: formValue.name,
      gender: formValue.gender,
      cpf: formValue.cpf.replace(/\D/g, ''), // Remove formatação
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
        }, 2500);
      },
      error: () => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao salvar cliente'
        });
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
        // Converte para formato ISO: YYYY-MM-DDTHH:mm:ss
        const isoDate = `${year}-${month}-${day}T00:00:00`;
        console.log('📅 Convertendo data de', date, 'para', isoDate);
        return isoDate;
      }

      // Se já estiver em formato ISO ou outro formato, retorna como está
      return date;
    }

    // Se for um objeto Date válido
    if (date instanceof Date && !isNaN(date.getTime())) {
      // Retorna no formato "1990-05-15T00:00:00"
      return date.toISOString().split('.')[0];
    }

    console.error('❌ Data inválida recebida:', date, typeof date);
    return '';
  }

  private formatDateToDDMMYYYY(date: string | Date | null): string {
    if (!date) {
      return '';
    }

    let dateObj: Date;

    // Se for string, converte para Date
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Verifica se é uma data válida
    if (isNaN(dateObj.getTime())) {
      console.error('❌ Data inválida ao formatar para DD/MM/YYYY:', date);
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

  searchCep(): void {
    const cep = this.clientForm.get('cep')?.value?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      // Aqui você pode integrar com uma API de CEP
      // Exemplo: https://viacep.com.br/ws/${cep}/json/
      console.log('Buscando CEP:', cep);
    }
  }
}
