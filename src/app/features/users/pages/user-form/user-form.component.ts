import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { User, Gender } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { Role } from '../../../roles/models/role.model';
import { ErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { switchMap } from 'rxjs/operators';

const CEP_DEBOUNCE_TIME = 800;
const FOCUS_NUMBER_DELAY = 0;

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
    InputNumberModule,
    ErrorModalComponent,
    SuccessModalComponent
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  errorModalService = inject(ErrorModalService);
  successModalService = inject(SuccessModalService);

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.email]],
    fullName: [''],
    password: [''],
    cpf: ['', [Validators.required]],
    birth: ['', [Validators.required, this.birthDateValidator.bind(this)]],
    gender: ['', [Validators.required]],
    roleId: [null, [Validators.required]],
    commissionPercentage: [null, [Validators.min(0), Validators.max(100)]],
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
  roles = signal<Role[]>([]);
  rolesLoading = signal(false);
  loading = signal(false);
  success = signal(false);
  formSubmitted = signal(false);
  loadingCep = signal(false);
  cepErrorMessage = signal('');
  isEditMode = signal(false);
  userId = signal<string | null>(null);
  isLoadingUserData = signal(false);
  originalFormValue: any = null;
  formModified = signal(false);

  ngOnInit(): void {
    this.loadRoles();

    this.userForm.get('address.cep')?.valueChanges.pipe(
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

    this.userForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.checkFormModified();
    });

    this.checkEditMode();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  private loadRoles(): void {
    this.rolesLoading.set(true);
    this.roleService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.rolesLoading.set(false);
      },
      error: () => {
        this.rolesLoading.set(false);
      }
    });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.isLoadingUserData.set(true);

    this.userService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user: any) => {
        this.userForm.patchValue({
          email: user.email,
          fullName: user.fullName,
          cpf: user.cpf,
          birth: this.formatDateToDDMMYYYY(user.birth),
          gender: user.gender,
          commissionPercentage: user.commissionPercentage ?? null,
          address: {
            cep: user.address?.cep || '',
            state: user.address?.state || '',
            city: user.address?.city || '',
            neighborhood: user.address?.neighborhood || '',
            street: user.address?.street || '',
            number: user.address?.number || '',
            complement: user.address?.complement || ''
          }
        }, { emitEvent: false });

        this.originalFormValue = { ...this.userForm.value };
        this.formModified.set(false);
        this.loading.set(false);
        this.isLoadingUserData.set(false);
      },
      error: () => {
        this.errorModalService.show('Falha ao carregar usuário');
        this.isLoadingUserData.set(false);
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 2000);
      }
    });
  }

  private formatDateToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private checkFormModified(): void {
    if (!this.isEditMode() || !this.originalFormValue) {
      this.formModified.set(true);
      return;
    }

    const currentValue = this.userForm.value;
    const hasChanges = JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
    this.formModified.set(hasChanges);
  }

  private birthDateValidator(control: any): { [key: string]: boolean } | null {
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

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.loading.set(true);
    const formValue = this.userForm.value;
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

    let birthISO = null;
    if (formValue.birth) {
      const parts = formValue.birth.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        birthISO = new Date(year, month, day).toISOString();
      }
    }

    const userPayload: any = {
      Email: formValue.email,
      FullName: formValue.fullName,
      Cpf: formValue.cpf,
      Birth: birthISO,
      Gender: formValue.gender || 3,
      Address: mappedAddress
    };

    if (!this.isEditMode() || formValue.password) {
      userPayload.Password = formValue.password;
    }

    if (this.isEditMode()) {
      userPayload.Id = this.userId();
    }

    const operation = this.isEditMode()
      ? this.userService.update(userPayload)
      : this.userService.create(userPayload);

    const successMessage = this.isEditMode()
      ? 'Usuário atualizado com sucesso!'
      : 'Usuário cadastrado com sucesso!';

    const errorMessage = this.isEditMode()
      ? 'Falha ao atualizar usuário'
      : 'Falha ao cadastrar usuário';

    operation.pipe(
      switchMap((response: any) => {
        const userId = this.isEditMode() ? this.userId() : response?.data?.id || response?.id;

        const selectedRoleId = formValue.roleId;
        const selectedRole = this.roles().find(r => r.id === selectedRoleId);

        if (!selectedRole) {
          return operation;
        }

        return this.userService.assignRole(userId, selectedRole.name);
      })
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (!this.isEditMode()) {
          this.userForm.reset();
        }
        this.loading.set(false);
        this.successModalService.show(successMessage);
        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/users']);
        }, 2000);
      },
      error: () => {
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

    if (this.isLoadingUserData()) {
      return;
    }

    if (cepLimpo.length !== 8 || this.loadingCep()) {
      return;
    }

    this.loadingCep.set(true);

    this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
