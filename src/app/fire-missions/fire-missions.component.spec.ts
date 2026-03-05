import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireMissionsComponent } from './fire-missions.component';

describe('FireMissionsComponent', () => {
  let component: FireMissionsComponent;
  let fixture: ComponentFixture<FireMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireMissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FireMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
