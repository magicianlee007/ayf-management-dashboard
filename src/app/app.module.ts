import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GasPriceService } from './services/gas-price/gas-price.service';
import { MaticComponent } from './matic/matic.component';
import { EthComponent } from './eth/eth.component';
@NgModule({
  declarations: [AppComponent, MaticComponent, EthComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [GasPriceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
