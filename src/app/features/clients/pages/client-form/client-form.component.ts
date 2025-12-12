import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  successModalService = inject(SuccessModalService);

  clientForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  clientId = signal<string | null>(null);
  maxDate: Date = new Date();

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
      name: ['', [Validators.required, Validators.minLength(3)]],
      gender: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birth: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      neighborhood: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      active: [true]
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
    this.clientService.getById(id).subscribe({
      next: (client) => {
        // Formatar dados para o formulário
        this.clientForm.patchValue({
          name: client.name,
          gender: client.gender,
          cpf: client.cpf,
          phone: client.phone,
          email: client.email,
          birth: new Date(client.birth),
          cep: client.address.cep,
          state: client.address.state,
          city: client.address.city,
          neighborhood: client.address.neighborhood,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar cliente'
        });
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

  private formatDateToISO(date: Date): string {
    // Retorna no formato "1990-05-15T00:00:00"
    return date.toISOString().split('.')[0];
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
