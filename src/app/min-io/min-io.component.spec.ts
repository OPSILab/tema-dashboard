import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinIOComponent } from './min-io.component';

describe('MinIOComponent', () => {
  let component: MinIOComponent;
  let fixture: ComponentFixture<MinIOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinIOComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinIOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
