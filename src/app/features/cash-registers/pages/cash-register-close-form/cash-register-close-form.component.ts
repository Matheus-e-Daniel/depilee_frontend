import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-cash-register-close-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './cash-register-close-form.component.html',
  styleUrls: ['./cash-register-close-form.component.scss']
})
export class CashRegisterCloseFormComponent {
  @Input() visible = false;
  @Input() loading = false;
  @Input() cashRegisterId!: number;
  @Output() confirm = new EventEmitter<{ finalBalance: number; notes?: string }>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    finalBalance: [null, [Validators.required]],
    notes: ['']
  });

  ngOnChanges() {
    if (this.visible) {
      this.form.reset();
    }
  }

  onConfirm() {
    if (this.form.valid) {
      this.confirm.emit({
        finalBalance: this.form.value.finalBalance,
        notes: this.form.value.notes
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
