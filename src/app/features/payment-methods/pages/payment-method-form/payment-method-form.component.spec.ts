import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodFormComponent } from './payment-method-form.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('PaymentMethodFormComponent', () => {
  let component: PaymentMethodFormComponent;
  let fixture: ComponentFixture<PaymentMethodFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodFormComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.paymentMethodForm.value).toEqual({
      name: 'Cartão de Crédito',
      type: 'CreditCard',
      allowInstallments: true,
      maxInstallments: 3,
      interestRatePerInstallment: 0.05,
      feePercentage: 2.5,
      description: 'Aceita Visa e Mastercard'
    });
  });
});
