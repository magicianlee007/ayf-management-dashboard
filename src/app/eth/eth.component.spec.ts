import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthComponent } from './eth.component';

describe('EthComponent', () => {
  let component: EthComponent;
  let fixture: ComponentFixture<EthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
