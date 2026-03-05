import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperativeComponent } from './operative.component';

describe('OperativeComponent', () => {
  let component: OperativeComponent;
  let fixture: ComponentFixture<OperativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
