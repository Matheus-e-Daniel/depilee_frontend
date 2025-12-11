import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderItemFormComponent } from './service-order-item-form.component';

describe('ServiceOrderItemFormComponent', () => {
  let component: ServiceOrderItemFormComponent;
  let fixture: ComponentFixture<ServiceOrderItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceOrderItemFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceOrderItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
