import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrionComponent } from './orion.component';

describe('OrionComponent', () => {
  let component: OrionComponent;
  let fixture: ComponentFixture<OrionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
