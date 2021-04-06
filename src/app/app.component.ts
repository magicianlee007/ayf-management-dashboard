import { Component } from '@angular/core';
import { ADAI_AUSDC_AUSDT_ADDRESS } from '../constants/contractAddresses';
import strategy1ABI from '../constants/strategy1ABI.json';

let Web3: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ayf-management-dashboard';
  web3: any;
  fund1Contract: any;
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
    this.fund1Contract = new this.web3.eth.Contract(
      strategy1ABI,
      ADAI_AUSDC_AUSDT_ADDRESS
    )
    const balance = await this.fund1Contract.methods.balanceOf('0x77cf32ed6667a1f9747f4c0a553c53f2745f96cc').call();
    console.log(this.web3.utils.fromWei(balance));
    console.log(balance);
  }
}
