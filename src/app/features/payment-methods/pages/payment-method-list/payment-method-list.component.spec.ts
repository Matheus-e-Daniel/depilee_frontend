import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodListComponent } from './payment-method-list.component';

describe('PaymentMethodListComponent', () => {
  let component: PaymentMethodListComponent;
  let fixture: ComponentFixture<PaymentMethodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a paymentMethods array', () => {
    expect(Array.isArray(component.paymentMethods)).toBeTrue();
    expect(component.paymentMethods.length).toBeGreaterThan(0);
  });
});
