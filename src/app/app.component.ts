import { Component } from '@angular/core';
import { IB3CRV } from '../constants/contractAddresses';
import ib3CRV from '../constants/ib3CRV.json';

let Web3: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ayf-management-dashboard';
  web3: any;
  ib3CRV: any;
  ib3CRVHolder: string;
  ib3CRVBalance: any;
  constructor() {
    this.ib3CRVHolder = '0x661bf31c780c37764f27f28b195f2b7e973c3c01';
    this.ib3CRVBalance = 0
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
      new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/f0f45988269240c1a220bd21fe5ea02a')
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
    this.ib3CRV = new this.web3.eth.Contract(
      ib3CRV,
      IB3CRV
    )
    const balanceInWei = await this.ib3CRV.methods.balanceOf(this.ib3CRVHolder).call();
    this.ib3CRVBalance = this.web3.utils.fromWei(balanceInWei);
  }
}
