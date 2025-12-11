import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderItemListComponent } from './service-order-item-list.component';

describe('ServiceOrderItemListComponent', () => {
  let component: ServiceOrderItemListComponent;
  let fixture: ComponentFixture<ServiceOrderItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceOrderItemListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceOrderItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
