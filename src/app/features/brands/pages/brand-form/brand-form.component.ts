import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { BrandService } from '../../services/brand.service';
import { BrandFormData } from '../../models/brand.model';
import { SuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { SuccessModalService } from '../../../../shared/components/success-modal/success-modal.service';
import { ErrorModalService } from '../../../../shared/components/error-modal/error-modal.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TooltipModule,
    SuccessModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './brand-form.component.html',
  styleUrls: ['./brand-form.component.scss']
})
export class BrandFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  successModalService = inject(SuccessModalService);
  errorModalService = inject(ErrorModalService);

  brandForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  brandId = signal<string | null>(null);
  formSubmitted = signal(false);
  formModified = signal(false);
  originalFormValue: any = null;

  showConfirmation = signal(false);
  confirmationLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.brandForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.brandForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isEditMode() && this.originalFormValue) {
        this.checkFormModified();
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.brandId.set(id);
      this.loadBrand(id);
    }
  }

  private loadBrand(id: string): void {
    this.loading.set(true);
    this.brandService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: brand }) => {
        this.brandForm.patchValue({
          name: brand.name
        });
       
        this.originalFormValue = JSON.stringify(this.brandForm.value);
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/brands']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.brandForm.invalid) {
      return;
    }

    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.confirmationLoading.set(true);
    const formData: BrandFormData = this.brandForm.value;

    const operation = this.isEditMode()
      ? this.brandService.update({ id: this.brandId()!, ...formData })
      : this.brandService.create(formData);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.confirmationLoading.set(false);
        this.showConfirmation.set(false);
        this.successModalService.show(
          this.isEditMode()
            ? 'Marca atualizada com sucesso!'
            : 'Marca criada com sucesso!'
        );

        setTimeout(() => {
          this.successModalService.hide();
          this.router.navigate(['/brands']);
        }, 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.confirmationLoading.set(false);
        this.errorModalService.show(err.error?.message || 'Falha ao salvar marca');
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmation.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/brands']);
  }

  private checkFormModified(): void {
    const currentValue = JSON.stringify(this.brandForm.value);
    this.formModified.set(currentValue !== this.originalFormValue);
  }
}

