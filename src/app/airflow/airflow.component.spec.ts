import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirflowComponent } from './airflow.component';

describe('AirflowComponent', () => {
  let component: AirflowComponent;
  let fixture: ComponentFixture<AirflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
