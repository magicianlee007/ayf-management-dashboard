import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaticComponent } from './matic.component';

describe('MaticComponent', () => {
  let component: MaticComponent;
  let fixture: ComponentFixture<MaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaticComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
