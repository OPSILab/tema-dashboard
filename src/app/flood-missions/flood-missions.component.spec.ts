import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloodMissionsComponent } from './flood-missions.component';

describe('FloodMissionsComponent', () => {
  let component: FloodMissionsComponent;
  let fixture: ComponentFixture<FloodMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloodMissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloodMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
