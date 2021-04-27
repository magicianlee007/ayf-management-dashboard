import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GasPriceService {
  constructor(private http: HttpClient) {}
  getCurrentGasPrice() {
    return this.http.get('https://ethgasstation.info/json/ethgasAPI.json');
  }
}
