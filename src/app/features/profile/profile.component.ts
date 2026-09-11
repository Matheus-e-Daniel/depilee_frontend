import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ProfileService, ProfileData } from './services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { SuccessModalComponent } from '../../shared/components/success-modal/success-modal.component';
import { ErrorModalService } from '../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../shared/components/success-modal/success-modal.service';
import { ChangePasswordModalComponent } from './components/change-password-modal/change-password-modal.component';

const CEP_DEBOUNCE_TIME = 800;

interface ViaCepResponse {
  erro?: boolean;
  uf?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
  complemento?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    CardModule,
    SuccessModalComponent,
    ChangePasswordModalComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  profile = signal<ProfileData | null>(null);
  loading = signal(false);
  saving = signal(false);
  editing = signal(false);
  showChangePassword = signal(false);
  loadingCep = signal(false);
  cepErrorMessage = signal('');

  genderOptions = [
    { label: 'Masculino', value: 1 },
    { label: 'Feminino', value: 2 },
    { label: 'Outro', value: 0 }
  ];

  profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required]],
    birth: ['', [Validators.required]],
    gender: this.fb.control<number | null>(null, Validators.required),
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

  formattedAddress = computed(() => {
    const address = this.profile()?.address;
    if (!address) return '—';

    const line = [address.street, address.number].filter(Boolean).join(', ');
    const rest = [address.neighborhood, [address.city, address.state].filter(Boolean).join('/')].filter(Boolean).join(', ');
    const formatted = [line, rest].filter(Boolean).join(' - ');

    return formatted || '—';
  });

  ngOnInit(): void {
    this.loadProfile();

    this.profileForm.get('address.cep')?.valueChanges.pipe(
      debounceTime(CEP_DEBOUNCE_TIME),
      distinctUntilChanged(),
      filter(cep => {
        this.cepErrorMessage.set('');
        const cepLimpo = cep?.replace(/\D/g, '') || '';
        return cepLimpo.length === 8;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(cep => {
      this.buscarCep(cep ?? '');
    });
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getOwnProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorModalService.show(err.error?.message || 'Falha ao carregar perfil');
        this.loading.set(false);
      }
    });
  }

  startEditing(): void {
    const current = this.profile();
    this.profileForm.patchValue({
      fullName: current?.fullName ?? '',
      email: current?.email ?? '',
      cpf: current?.cpf ?? '',
      birth: this.formatDateToDDMMYYYY(current?.birth ?? ''),
      gender: current?.gender ?? null,
      address: {
        cep: current?.address?.cep ?? '',
        state: current?.address?.state ?? '',
        city: current?.address?.city ?? '',
        street: current?.address?.street ?? '',
        number: current?.address?.number ?? '',
        neighborhood: current?.address?.neighborhood ?? '',
        complement: current?.address?.complement ?? ''
      }
    });
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
  }

  private formatDateToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, email, cpf, birth, gender, address } = this.profileForm.value;

    let birthISO = '';
    if (birth) {
      const parts = birth.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        birthISO = new Date(year, month, day).toISOString();
      }
    }

    this.saving.set(true);
    this.profileService.updateOwnProfile({
      fullName: fullName!,
      email: email!,
      cpf: cpf!,
      birth: birthISO,
      gender: gender!,
      address: address as ProfileData['address']
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.profile.update(p => p && { ...p, fullName: fullName!, email: email!, cpf: cpf!, birth: birthISO, gender: gender!, address: address as ProfileData['address'] });

        const userData = this.authService.getUserData();
        if (userData) {
          this.authService.setUserData({ ...userData, email: email!, userName: email! });
        }

        this.successModalService.show('Perfil atualizado com sucesso!');
        setTimeout(() => this.successModalService.hide(), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao atualizar perfil');
      }
    });
  }

  buscarCep(cep: string): void {
    const cepLimpo = cep.replace(/\D/g, '');
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

        const addressGroup = this.profileForm.get('address') as FormGroup;
        addressGroup.patchValue({
          state: data.uf,
          city: data.localidade,
          neighborhood: data.bairro,
          street: data.logradouro,
          complement: data.complemento
        }, { emitEvent: false });

        this.loadingCep.set(false);
      },
      error: () => {
        this.errorModalService.show('Erro ao buscar CEP');
        this.cepErrorMessage.set('Por favor, digite um CEP válido');
        this.loadingCep.set(false);
      }
    });
  }

  openChangePassword(): void {
    this.showChangePassword.set(true);
  }

  closeChangePassword(): void {
    this.showChangePassword.set(false);
  }
}
