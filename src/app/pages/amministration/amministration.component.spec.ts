import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmministrationComponent } from './amministration.component';

describe('AmministrationComponent', () => {
  let component: AmministrationComponent;
  let fixture: ComponentFixture<AmministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmministrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
