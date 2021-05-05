import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GasPriceService } from '../services/gas-price/gas-price.service';

import {
  MATIC_USDC,
  MATIC_FARM_BOSS_USDC,
  MATIC_FARM_TREASURY_USDC,
  MATIC_AM_USDC,
  MATIC_CURVE_AAVE_POOL,
  MATIC_CURVE_AAVE_GAUGE_POOL,
  MATIC_CURVE_WMATIC,
} from '../../constants/contractAddresses';
import farmBossUSDCAbi from '../../constants/FarmBossUSDC.json';
import farmTreasuryAbi from '../../constants/FarmTreasury.json';
import usdcAbi from '../../constants/usdc.json';
import balanceAbi from '../../constants/BalanceOfABI.json';
import crvGaugeAbi from '../../constants/maticCrvGauge.json';
import crvPool from '../../constants/crvPool.json';
let Web3: any;
const COIN_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=wmatic,usd-coin&vs_currencies=usd';
@Component({
  selector: 'app-matic',
  templateUrl: './matic.component.html',
  styleUrls: ['./matic.component.scss'],
})
export class MaticComponent implements OnInit {
  web3: any;
  // accounts
  accounts = [];

  // USDC Contract
  usdc: any;
  // Curve AAVE USDC contract
  amUSDC: any;
  curveAAVEPool: any;
  curveAAVEGaugePool: any;

  // FarmBossUSDC
  fbUSDC_Contract: any;
  fbUSDC_Balance = {
    usdc: 0,
    amGaugeUSDC: 0,
    totalValue: 0,
    unclaimedWMatic: 0,
    unclaimedTotalValue: 0,
    crvVirtualPrice: 0,
  };
  // FarmTreasuryUSDC
  ftUSDC_Contract: any;
  ftUSDC_Balance = { usdc: 0, aum: 0 };

  // coin price
  wMaticPrice = 0;
  usdcPrice = 0;

  // Params
  fbRebalanceToken: string = 'usdc';
  fbRebalanceAmount: string = '';
  fbRebalanceAddress: string = '';
  fbSwapToken: string = 'usdc';
  fbSwapCallData: string = '';
  fbSwapIsSushi: string = 'sushi';
  fbExecuteToken: string = 'usdc';
  fbExecuteAddress: string = '';
  fbExecuteAmount: string = '';
  fbExecuteCallData: string = '';

  constructor(private http: HttpClient, private gasService: GasPriceService) {
    if (!window['Web3']) {
      this.injectScript();
    } else {
      this.generateProvider();
      this.initContract();
    }
  }
  ngOnInit() {
    this.http.get(COIN_PRICE_URL).subscribe((res) => {
      this.wMaticPrice = res['wmatic']['usd'];
      this.usdcPrice = res['usd-coin']['usd'];
    });
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
  async generateProvider() {
    Web3 = window['Web3'];
    if (window['web3'].currentProvider) {
      console.log('web3 active', window['web3'].currentProvider);
      this.web3 = new Web3(window['web3'].currentProvider);
      this.accounts = await (window['web3'].currentProvider as any).request({
        method: 'eth_requestAccounts',
      });
    } else {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider(
          'https://mainnet.infura.io/v3/f0f45988269240c1a220bd21fe5ea02a'
        )
      );
    }
    console.log('Web3 Generated', this.web3);
  }
  async onSuccess() {
    console.log('success loading script');
    await this.generateProvider();
    this.initContract();
  }
  onError() {
    console.error('web3 error injected');
  }
  async initContract() {
    this.fbUSDC_Contract = new this.web3.eth.Contract(
      farmBossUSDCAbi,
      MATIC_FARM_BOSS_USDC
    );

    this.usdc = new this.web3.eth.Contract(usdcAbi, MATIC_USDC);
    const usdcBalanceWei = await this.usdc.methods
      .balanceOf(MATIC_FARM_BOSS_USDC)
      .call();
    this.fbUSDC_Balance.usdc = this.web3.utils.fromWei(usdcBalanceWei, 'mwei');

    this.curveAAVEPool = new this.web3.eth.Contract(
      crvPool,
      MATIC_CURVE_AAVE_POOL
    );
    const usdcVirtualPriceInWei = await this.curveAAVEPool.methods
      .get_virtual_price()
      .call();
    this.fbUSDC_Balance.crvVirtualPrice = this.web3.utils.fromWei(
      usdcVirtualPriceInWei
    );

    this.curveAAVEGaugePool = new this.web3.eth.Contract(
      crvGaugeAbi,
      MATIC_CURVE_AAVE_GAUGE_POOL
    );
    const amUSDCBalanceWei = await this.curveAAVEGaugePool.methods
      .balanceOf(MATIC_FARM_BOSS_USDC)
      .call();
    this.fbUSDC_Balance.amGaugeUSDC = this.web3.utils.fromWei(amUSDCBalanceWei);
    const crvClaimableReward = await this.curveAAVEGaugePool.methods
      .claimable_reward(MATIC_FARM_BOSS_USDC, MATIC_CURVE_WMATIC)
      .call();
    this.fbUSDC_Balance.unclaimedWMatic = this.web3.utils.fromWei(
      crvClaimableReward
    );
    this.fbUSDC_Balance.totalValue =
      this.fbUSDC_Balance.usdc * this.usdcPrice +
      this.fbUSDC_Balance.amGaugeUSDC * this.usdcPrice;

    this.fbUSDC_Balance.unclaimedTotalValue =
      this.fbUSDC_Balance.unclaimedWMatic * this.wMaticPrice;

    // FarmTreasury Contract Creation
    const ftUSDCBalanceWei = await this.usdc.methods
      .balanceOf(MATIC_FARM_TREASURY_USDC)
      .call();
    this.ftUSDC_Balance.usdc = parseFloat(
      this.web3.utils.fromWei(ftUSDCBalanceWei, 'mwei')
    );
    this.ftUSDC_Contract = new this.web3.eth.Contract(
      farmTreasuryAbi,
      MATIC_FARM_TREASURY_USDC
    );
    const ftUSDCAUMBalanceWei = await this.ftUSDC_Contract.methods
      .totalUnderlying()
      .call();
    this.ftUSDC_Balance.aum = parseFloat(
      this.web3.utils.fromWei(ftUSDCAUMBalanceWei, 'mwei')
    );
  }

  async rebalance() {
    if (this.accounts.length > 0) {
      let farmBossContract =
        this.fbRebalanceToken === 'usdc' ? this.fbUSDC_Contract : null;

      this.gasService.getCurrentGasPrice().subscribe(async (res) => {
        let rebalanceAmountInWei = this.web3.utils.toWei(
          this.fbRebalanceAmount
        );
        if (this.fbRebalanceToken === 'wbtc') {
          rebalanceAmountInWei =
            this.web3.utils.toWei(this.fbRebalanceAmount, 'gwei') / 10;
        }
        const gasPrice = res['average'] / 10;
        await farmBossContract.methods
          .rebalanceUp(rebalanceAmountInWei, this.fbRebalanceAddress)
          .send({
            from: this.accounts[0],
            gasPrice: this.web3.utils.toWei(gasPrice.toString(), 'gwei'),
            gas: '500000',
          })
          .on('transactionHash', function (hash) {
            console.log('==============Transaction Succeed=============');
            console.log('TxHash', hash);
            console.log('==============================================');
          })
          .on('receipt', function (receipt) {
            console.log('=============Transaction Receipt=============');
            console.log('Receipt', receipt);
            console.log('=============================================');
          })
          .on('confirmation', function (confirmationNumber, receipt) {
            console.log('==============Transaction Confirmation=============');
            console.log('Confirmation Number', confirmationNumber);
            console.log('Receipt', receipt);
            console.log('===================================================');
          })
          .on('error', function (error, receipt) {
            console.log('============Transaction Failed==============');
            console.log('Confirmation Number', error);
            console.log('Receipt', receipt);
            console.log('============================================');
          });
      });
    }
  }

  async sellExactTokensForUnderlyingToken() {
    console.log(this.fbSwapCallData, this.fbSwapIsSushi, this.fbSwapToken);
    if (this.accounts.length > 0) {
      let farmBossContract =
        this.fbSwapToken === 'usdc' ? this.fbUSDC_Contract : null;
      this.gasService.getCurrentGasPrice().subscribe(async (res) => {
        const gasPrice = res['average'] / 10;
        await farmBossContract.methods
          .sellExactTokensForUnderlyingToken(
            this.web3.utils.toHex(parseInt(this.fbSwapCallData)),
            this.fbSwapIsSushi === 'sushi'
          )
          .send({
            from: this.accounts[0],
            gasPrice: this.web3.utils.toWei(gasPrice.toString(), 'gwei'),
            gas: '500000',
          })
          .on('transactionHash', function (hash) {
            console.log('==============Transaction Succeed=============');
            console.log('TxHash', hash);
            console.log('==============================================');
          })
          .on('receipt', function (receipt) {
            console.log('=============Transaction Receipt=============');
            console.log('Receipt', receipt);
            console.log('=============================================');
          })
          .on('confirmation', function (confirmationNumber, receipt) {
            console.log('==============Transaction Confirmation=============');
            console.log('Confirmation Number', confirmationNumber);
            console.log('Receipt', receipt);
            console.log('===================================================');
          })
          .on('error', function (error, receipt) {
            console.log('============Transaction Failed==============');
            console.log('Confirmation Number', error);
            console.log('Receipt', receipt);
            console.log('============================================');
          });
      });
    }
  }

  async farmerExecute() {
    console.log(
      this.fbExecuteToken,
      this.fbExecuteAddress,
      this.fbExecuteAmount,
      this.fbExecuteCallData
    );
    if (this.accounts.length > 0) {
      let farmBossContract =
        this.fbExecuteToken === 'usdc' ? this.fbUSDC_Contract : null;
      this.gasService.getCurrentGasPrice().subscribe(async (res) => {
        const gasPrice = res['average'] / 10;
        let executeAmountInWei = this.web3.utils.toWei(this.fbExecuteAmount);
        if (this.fbExecuteToken === 'wbtc') {
          executeAmountInWei =
            this.web3.utils.toWei(this.fbExecuteAmount, 'gwei') / 10;
        }
        await farmBossContract.methods
          .farmerExecute(
            this.fbExecuteAddress,
            executeAmountInWei,
            this.web3.utils.toHex(parseInt(this.fbExecuteCallData))
          )
          .send({
            from: this.accounts[0],
            gasPrice: this.web3.utils.toWei(gasPrice.toString(), 'gwei'),
            gas: '500000',
          })
          .on('transactionHash', function (hash) {
            console.log('==============Transaction Succeed=============');
            console.log('TxHash', hash);
            console.log('==============================================');
          })
          .on('receipt', function (receipt) {
            console.log('=============Transaction Receipt=============');
            console.log('Receipt', receipt);
            console.log('=============================================');
          })
          .on('confirmation', function (confirmationNumber, receipt) {
            console.log('==============Transaction Confirmation=============');
            console.log('Confirmation Number', confirmationNumber);
            console.log('Receipt', receipt);
            console.log('===================================================');
          })
          .on('error', function (error, receipt) {
            console.log('============Transaction Failed==============');
            console.log('Confirmation Number', error);
            console.log('Receipt', receipt);
            console.log('============================================');
          });
      });
    }
  }
}
