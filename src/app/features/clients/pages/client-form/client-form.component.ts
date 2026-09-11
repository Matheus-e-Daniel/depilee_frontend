import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { ServiceOrderService } from '../../../service-orders/services/service-order.service';
import { ServiceOrder, OrderStatus } from '../../../service-orders/models/service-order.model';

const CEP_DEBOUNCE_TIME = 800;
const FOCUS_NUMBER_DELAY = 0;
const SUCCESS_REDIRECT_DELAY = 2500;

import { ClientFormData } from '../../models/client.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';

interface ViaCepResponse {
  erro?: boolean;
  uf?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
  complemento?: string;
}

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
    TabViewModule,
    TableModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})

export class ClientFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private serviceOrderService = inject(ServiceOrderService);
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
  originalFormValue: string | null = null;
  formModified = signal(false);
  cepErrorMessage = signal('');
  formSubmitted = signal(false);

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  clientOrders = signal<ServiceOrder[]>([]);
  clientOrdersLoading = signal(false);
  OrderStatus = OrderStatus;

  client = signal<Client | null>(null);
  showAdjustCredit = signal(false);
  adjustingCredit = signal(false);
  adjustCreditForm!: FormGroup;

  genderOptions = [
    { label: 'Masculino', value: 1 },
    { label: 'Feminino', value: 2 },
    { label: 'Outro', value: 0 }
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
    this.adjustCreditForm = this.fb.group({
      amount: [0, [Validators.required]],
      reason: ['']
    });

    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      cpf: [''],
      phone: [''],
      email: [''],
      birth: ['', [this.birthDateValidator]],
      cep: [''],
      state: [''],
      city: [''],
      neighborhood: [''],
      street: [''],
      number: [''],
      complement: [''],
      active: [true]
    });

    this.clientForm.get('cep')?.valueChanges.pipe(
      debounceTime(CEP_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(cep => {
        this.cepErrorMessage.set('');
        const cepLimpo = cep?.replace(/\D/g, '') || '';
        return cepLimpo.length === 8;
      })
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cep => {
      this.buscarCep(cep);
    });

    this.clientForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.checkFormModified();
    });
  }

  private birthDateValidator(control: AbstractControl): Record<string, boolean> | null {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    let year: number;
    let month: number;
    let day: number;

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

    if (month > 12 || month < 1) {
      return { invalidMonth: true };
    }

    if (day < 1 || day > 31) {
      return { invalidDay: true };
    }

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

    this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
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

  private loadClientOrders(clientId: number): void {
    this.clientOrdersLoading.set(true);
    this.serviceOrderService.getAll(clientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => {
        this.clientOrders.set(data);
        this.clientOrdersLoading.set(false);
      },
      error: () => {
        this.clientOrdersLoading.set(false);
      }
    });
  }

  getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.Draft]: 'Rascunho',
      [OrderStatus.Open]: 'Aberta',
      [OrderStatus.Paid]: 'Paga',
      [OrderStatus.Completed]: 'Concluída',
      [OrderStatus.Cancelled]: 'Cancelada'
    };
    return labels[status] ?? 'Desconhecido';
  }

  openAdjustCredit(): void {
    this.adjustCreditForm.reset({ amount: 0, reason: '' });
    this.showAdjustCredit.set(true);
  }

  closeAdjustCredit(): void {
    this.showAdjustCredit.set(false);
  }

  submitAdjustCredit(): void {
    const clientId = this.clientId();
    if (!clientId || this.adjustCreditForm.invalid) {
      this.adjustCreditForm.markAllAsTouched();
      return;
    }

    const { amount, reason } = this.adjustCreditForm.value;
    if (!amount) {
      return;
    }

    this.adjustingCredit.set(true);
    this.clientService.adjustCredit(parseInt(clientId, 10), amount, reason || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ data: updatedClient }) => {
          this.adjustingCredit.set(false);
          this.showAdjustCredit.set(false);
          this.client.set(updatedClient);
          this.successModalService.show('Saldo de Haver atualizado!');
          setTimeout(() => this.successModalService.hide(), 1500);
        },
        error: (err: HttpErrorResponse) => {
          this.adjustingCredit.set(false);
          this.errorModalService.show(err.error?.message || 'Falha ao ajustar saldo de Haver');
        }
      });
  }

  getOrderStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case OrderStatus.Paid:
      case OrderStatus.Completed:
        return 'success';
      case OrderStatus.Cancelled:
        return 'danger';
      case OrderStatus.Open:
        return 'info';
      default:
        return 'warning';
    }
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

    this.clientService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: client }) => {
        this.client.set(client);
        this.clientForm.patchValue({
          name: client.name,
          gender: client.gender,
          cpf: client.cpf,
          phone: client.phone,
          email: client.email,
          birth: this.formatDateToDDMMYYYY(client.birth),
          cep: client.address?.cep || '',
          state: client.address?.state || '',
          city: client.address?.city || '',
          neighborhood: client.address?.neighborhood || '',
          street: client.address?.street || '',
          number: client.address?.number || '',
          complement: client.address?.complement || ''
        }, { emitEvent: false });

        this.originalFormValue = { ...this.clientForm.value };
        this.formModified.set(false);
        this.loading.set(false);
        this.isLoadingClientData.set(false);
        this.loadClientOrders(parseInt(id, 10));
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao carregar cliente');
        this.isLoadingClientData.set(false);
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 1500);
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
      gender: formValue.gender ?? 0,
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

    const operation = this.isEditMode()
      ? this.clientService.update({ id: parseInt(this.clientId()!), ...formData })
      : this.clientService.create(formData);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
      error: (err: HttpErrorResponse) => {
        this.showConfirmation.set(false);
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao salvar cliente');
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

    if (typeof date === 'string') {
      const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = date.match(ddmmyyyyPattern);

      if (match) {
        const [, day, month, year] = match;
        const isoDate = `${year}-${month}-${day}T00:00:00`;
        return isoDate;
      }

      return date;
    }

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

  onCepFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCepClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCpfFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onCpfClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onPhoneFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onPhoneClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onBirthFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }

  onBirthClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const firstEmptyPosition = value.length;
    setTimeout(() => {
      input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
    }, 0);
  }
}
