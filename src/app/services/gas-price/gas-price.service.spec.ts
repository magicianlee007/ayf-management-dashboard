import { TestBed } from '@angular/core/testing';

import { GasPriceService } from './gas-price.service';

describe('GasPriceService', () => {
  let service: GasPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GasPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
