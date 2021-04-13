import { Component } from '@angular/core';
import {
  IB3CRV_GAUGE,
  IDLE_USDC,
  USDC,
  FarmBoss_USDC,
} from '../constants/contractAddresses';
import ib3CRV_GAUGE from '../constants/ib3CRV_GAUGE.json';
import idle_USDC from '../constants/idle_USDC.json';
import usdc from '../constants/usdc.json';

let Web3: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ayf-management-dashboard';
  web3: any;
  ib3CRV_GAUGE: any;
  idle_USDC: any;
  usdc: any;
  fbUSDC_Balance = { usdc: '0', ib3CRV_Gauge: '0', idle_USDC: '0' };

  constructor() {
    if (!window['Web3']) {
      this.injectScript();
    } else {
      this.generateProvider();
    }
  }
  injectScript() {
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.35/dist/web3.js';
    script.async = true;

    script.onload = this.onSuccess.bind(this);

    script.onerror = this.onError.bind(this);

    document.head.appendChild(script);
  }
  generateProvider() {
    Web3 = window['Web3'];
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://mainnet.infura.io/v3/f0f45988269240c1a220bd21fe5ea02a'
      )
    );
    console.log(this.web3);
  }
  onSuccess() {
    this.generateProvider();
    this.initContract();
  }
  onError() {
    console.error('web3 error injected');
  }
  async initContract() {
    // Create ib3CRV_GAUGE, USDC, idle_USDC contract

    this.ib3CRV_GAUGE = new this.web3.eth.Contract(ib3CRV_GAUGE, IB3CRV_GAUGE);

    this.idle_USDC = new this.web3.eth.Contract(idle_USDC, IDLE_USDC);

    this.usdc = new this.web3.eth.Contract(usdc, USDC);

    // Get the balance of FarmBoss_USDC
    const usdcBalanceWei = await this.usdc.methods
      .balanceOf(FarmBoss_USDC)
      .call();
    const usdcDecimals = await this.usdc.methods.decimals().call();
    console.log(usdcBalanceWei);
    this.fbUSDC_Balance.usdc = this.web3.utils.fromWei(usdcBalanceWei, 'mwei');
    const idleUSDCBalanceWei = await this.idle_USDC.methods
      .balanceOf(FarmBoss_USDC)
      .call();
    this.fbUSDC_Balance.idle_USDC = this.web3.utils.fromWei(idleUSDCBalanceWei);
    const ib3CRV_GaugeBalanceWei = await this.ib3CRV_GAUGE.methods
      .balanceOf(FarmBoss_USDC)
      .call();
    this.fbUSDC_Balance.ib3CRV_Gauge = this.web3.utils.fromWei(
      ib3CRV_GaugeBalanceWei
    );
  }
}
