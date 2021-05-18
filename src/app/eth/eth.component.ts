import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GasPriceService } from '../services/gas-price/gas-price.service';

import {
  IB3CRV_GAUGE,
  USDC,
  FarmBoss_USDC,
  SETH,
  WETH,
  ECRV_GAUGE,
  FarmBoss_ETH,
  WBTC,
  COMPOUND_WBTC,
  STACK_ETH,
  HBTC_GAUGE,
  FarmBoss_WBTC,
  FarmTreasury_USDC,
  FarmTreasury_ETH,
  FarmTreasury_WBTC,
  CRV_IB_POOL,
  CRV_ETH_POOL,
  CRV_WBTC_POOL,
} from '../../constants/contractAddresses';
import crvGauge from '../../constants/crvGauge.json';
import usdc from '../../constants/usdc.json';
import balanceABI from '../../constants/BalanceOfABI.json';
import yVaultABI from '../../constants/yVault.json';
import farmTreasury from '../../constants/FarmTreasury.json';
import crvPool from '../../constants/crvPool.json';
import farmBossUSDC from '../../constants/FarmBossUSDC.json';
import farmBossETH from '../../constants/FarmBossETH.json';
import farmBossWBTC from '../../constants/FarmBossWBTC.json';
import detectEthereumProvider from '@metamask/detect-provider';

let Web3: any;
const COIN_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,compound-wrapped-btc,interest-bearing-eth,idle,curve-dao-token&vs_currencies=usd';

@Component({
  selector: 'app-eth',
  templateUrl: './eth.component.html',
  styleUrls: ['./eth.component.scss'],
})
export class EthComponent {
  title = 'ayf-management-dashboard';
  web3: any;
  // stableSwap
  crvUSDCPool: any;
  crvETHPool: any;
  crvWBTCPool: any;
  // usdc reward token contract
  ib3CRV_GAUGE: any;
  usdc: any;

  // eth reward token contract
  sETH: any;
  wETH: any;
  eCRV_GAUGE: any;

  // wbtc reward contract
  wBTC: any;
  compound_BTC: any;
  stack_ETH: any;
  hCrvGauge: any;

  // accounts
  accounts = [];

  // farmboss contract
  farmBossUSDC: any;
  farmBossETH: any;
  farmBossWBTC: any;

  // treasury contract
  farmTreasuryUSDC: any;
  farmTreasuryETH: any;
  farmTreasuryWBTC: any;

  // coin price
  ethPrice = 0;
  wBTCPrice = 0;
  usdcPrice = 1;
  compoundBTCPrice = 0;
  ibETHPrice = 0;
  crvPrice = 0;
  // Balance

  fbUSDC_Balance = {
    usdc: 0,
    ib3CRV_Gauge: 0,
    totalValue: 0,
    unclaimedCrv: 0,
    unclaimedTotalValue: 0,
    crvVirtualPrice: 0,
  };
  fbETH_Balance = {
    wETH: 0,
    sETH: 0,
    eCRV_Gauge: 0,
    totalValue: 0,
    unclaimedCrv: 0,
    uncalimedTotalValue: 0,
    crvVirtualPrice: 0,
    pricePerShare: 0,
    totalAssets: 0,
  };
  fbWBTC_Balance = {
    wBTC: 0,
    compound_WBTC: 0,
    stack_ETH: 0,
    totalValue: 0,
    unclaimedCrv: 0,
    hCrvGauge: 0,
    crvVirtualPrice: 0,
  };

  ftUSDC_Balance = { usdc: 0, aum: 0 };
  ftWETH_Balance = { wETH: 0, aum: 0 };
  ftWBTC_Balance = { wBTC: 0, aum: 0 };

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
      this.ethPrice = res['ethereum']['usd'];
      this.wBTCPrice = res['wrapped-bitcoin']['usd'];
      this.compoundBTCPrice = res['compound-wrapped-btc']['usd'];
      this.ibETHPrice = res['interest-bearing-eth']['usd'];
      this.crvPrice = res['curve-dao-token']['usd'];
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
    console.log('init contract');
    // Create FarmBoss Contract
    this.farmBossUSDC = new this.web3.eth.Contract(farmBossUSDC, FarmBoss_USDC);
    this.farmBossETH = new this.web3.eth.Contract(farmBossETH, FarmBoss_ETH);
    this.farmBossWBTC = new this.web3.eth.Contract(farmBossWBTC, FarmBoss_WBTC);

    // Create ib3CRV_GAUGE, USDC, idle_USDC contract

    this.ib3CRV_GAUGE = new this.web3.eth.Contract(crvGauge, IB3CRV_GAUGE);

    this.usdc = new this.web3.eth.Contract(usdc, USDC);

    // Get the balance of FarmBoss_USDC
    const usdcBalanceWei = await this.usdc.methods
      .balanceOf(FarmBoss_USDC)
      .call();
    // const usdcDecimals = await this.usdc.methods.decimals().call();
    this.fbUSDC_Balance.usdc = this.web3.utils.fromWei(usdcBalanceWei, 'mwei');

    const ib3CRV_GaugeBalanceWei = await this.ib3CRV_GAUGE.methods
      .balanceOf(FarmBoss_USDC)
      .call();
    this.fbUSDC_Balance.ib3CRV_Gauge = this.web3.utils.fromWei(
      ib3CRV_GaugeBalanceWei
    );

    const crvUnclaimedRewards = await this.ib3CRV_GAUGE.methods
      .claimable_tokens(FarmBoss_USDC)
      .call();
    this.fbUSDC_Balance.unclaimedCrv =
      this.web3.utils.fromWei(crvUnclaimedRewards);

    this.fbUSDC_Balance.totalValue =
      this.fbUSDC_Balance.usdc * this.usdcPrice +
      this.fbUSDC_Balance.ib3CRV_Gauge * this.usdcPrice;
    // Get unclaimed total value
    this.fbUSDC_Balance.unclaimedTotalValue =
      this.fbUSDC_Balance.unclaimedCrv * this.crvPrice;

    // Create crvStableSwap contract
    this.crvUSDCPool = new this.web3.eth.Contract(crvPool, CRV_IB_POOL);
    const usdcVirtualPriceWei = await this.crvUSDCPool.methods
      .get_virtual_price()
      .call();
    this.fbUSDC_Balance.crvVirtualPrice =
      this.web3.utils.fromWei(usdcVirtualPriceWei);

    // Get the balance of FarmBoss_ETH
    this.wETH = new this.web3.eth.Contract(balanceABI, WETH);
    const wEthBalanceWei = await this.wETH.methods
      .balanceOf(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.wETH = this.web3.utils.fromWei(wEthBalanceWei);

    this.sETH = new this.web3.eth.Contract(yVaultABI, SETH);
    const sEthBalanceWei = await this.sETH.methods
      .balanceOf(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.sETH = this.web3.utils.fromWei(sEthBalanceWei);

    const totalSupplyWei = await this.sETH.methods.totalSupply().call();

    this.fbETH_Balance.totalAssets = this.web3.utils.fromWei(totalSupplyWei);

    const pricePerShareWei = await this.sETH.methods.pricePerShare().call();
    this.fbETH_Balance.pricePerShare =
      this.web3.utils.fromWei(pricePerShareWei);

    this.fbETH_Balance.totalValue =
      this.fbETH_Balance.sETH * this.ethPrice +
      this.fbETH_Balance.wETH * this.ethPrice;

    this.crvETHPool = new this.web3.eth.Contract(crvPool, CRV_ETH_POOL);
    const ethVirtualPriceWei = await this.crvETHPool.methods
      .get_virtual_price()
      .call();
    this.fbETH_Balance.crvVirtualPrice =
      this.web3.utils.fromWei(ethVirtualPriceWei);

    // Get the balance of the FarmBossWBTC
    this.wBTC = new this.web3.eth.Contract(balanceABI, WBTC);
    const wBTCBalanceWei = await this.wBTC.methods
      .balanceOf(FarmBoss_WBTC)
      .call();
    this.fbWBTC_Balance.wBTC =
      this.web3.utils.fromWei(wBTCBalanceWei, 'gwei') * 10;

    this.compound_BTC = new this.web3.eth.Contract(balanceABI, COMPOUND_WBTC);
    const compoundWBTCBalanceWei = await this.compound_BTC.methods
      .balanceOf(FarmBoss_WBTC)
      .call();
    this.fbWBTC_Balance.compound_WBTC =
      this.web3.utils.fromWei(compoundWBTCBalanceWei, 'gwei') * 10;

    this.stack_ETH = new this.web3.eth.Contract(balanceABI, STACK_ETH);
    const stackETHBalanceWei = await this.stack_ETH.methods
      .balanceOf(FarmBoss_WBTC)
      .call();
    this.fbWBTC_Balance.stack_ETH = this.web3.utils.fromWei(stackETHBalanceWei);

    this.hCrvGauge = new this.web3.eth.Contract(crvGauge, HBTC_GAUGE);
    const hCrvGaugeInWei = await this.hCrvGauge.methods
      .balanceOf(FarmBoss_WBTC)
      .call();
    this.fbWBTC_Balance.hCrvGauge = this.web3.utils.fromWei(hCrvGaugeInWei);
    const unclaimedCrvWbtcWei = await this.hCrvGauge.methods
      .claimable_tokens(FarmBoss_WBTC)
      .call();
    this.fbWBTC_Balance.unclaimedCrv =
      this.web3.utils.fromWei(unclaimedCrvWbtcWei);
    this.fbWBTC_Balance.totalValue =
      this.fbWBTC_Balance.compound_WBTC * this.compoundBTCPrice +
      this.fbWBTC_Balance.wBTC * this.wBTCPrice +
      this.fbWBTC_Balance.hCrvGauge * this.wBTCPrice;

    this.crvWBTCPool = new this.web3.eth.Contract(crvPool, CRV_WBTC_POOL);
    const wbtcVirtualPriceWei = await this.crvWBTCPool.methods
      .get_virtual_price()
      .call();
    this.fbWBTC_Balance.crvVirtualPrice =
      this.web3.utils.fromWei(wbtcVirtualPriceWei);
    // Get the FarmTreasuryUSDC's USDC balance
    const ftUSDCBalanceWei = await this.usdc.methods
      .balanceOf(FarmTreasury_USDC)
      .call();
    this.ftUSDC_Balance.usdc = parseFloat(
      this.web3.utils.fromWei(ftUSDCBalanceWei, 'mwei')
    );

    this.farmTreasuryUSDC = new this.web3.eth.Contract(
      farmTreasury,
      FarmTreasury_USDC
    );
    const ftUSDCAUMBalanceWei = await this.farmTreasuryUSDC.methods
      .totalUnderlying()
      .call();
    this.ftUSDC_Balance.aum = parseFloat(
      this.web3.utils.fromWei(ftUSDCAUMBalanceWei, 'mwei')
    );

    // Get the FarmTreasuryETH's WETH balance
    const ftETHBalanceWei = await this.wETH.methods
      .balanceOf(FarmTreasury_ETH)
      .call();
    this.ftWETH_Balance.wETH = parseFloat(
      this.web3.utils.fromWei(ftETHBalanceWei)
    );

    this.farmTreasuryETH = new this.web3.eth.Contract(
      farmTreasury,
      FarmTreasury_ETH
    );
    const ftETHAUMBalanceWei = await this.farmTreasuryETH.methods
      .totalUnderlying()
      .call();
    this.ftWETH_Balance.aum = parseFloat(
      this.web3.utils.fromWei(ftETHAUMBalanceWei)
    );

    // Get the FarmTreasuryWBTC's WBTC balance
    const ftWBTCBalanceWei = await this.wBTC.methods
      .balanceOf(FarmTreasury_WBTC)
      .call();
    this.ftWBTC_Balance.wBTC =
      this.web3.utils.fromWei(ftWBTCBalanceWei, 'gwei') * 10;
    this.farmTreasuryWBTC = new this.web3.eth.Contract(
      farmTreasury,
      FarmTreasury_WBTC
    );
    const ftWBTCAUMBalanceWei = await this.farmTreasuryWBTC.methods
      .totalUnderlying()
      .call();
    this.ftWBTC_Balance.aum =
      this.web3.utils.fromWei(ftWBTCAUMBalanceWei, 'gwei') * 10;
  }

  async connectWallet() {
    const provider = await detectEthereumProvider();
    if (provider) {
      const accounts = await (provider as any).request({
        method: 'eth_requestAccounts',
      });
    }
  }
  async rebalance() {
    if (this.accounts.length > 0) {
      let farmBossContract =
        this.fbRebalanceToken === 'usdc'
          ? this.farmBossUSDC
          : this.fbRebalanceToken === 'eth'
          ? this.farmBossETH
          : this.farmBossWBTC;

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
        this.fbSwapToken === 'usdc'
          ? this.farmBossUSDC
          : this.fbSwapToken === 'eth'
          ? this.farmBossETH
          : this.farmBossWBTC;
      this.gasService.getCurrentGasPrice().subscribe(async (res) => {
        const gasPrice = res['average'] / 10;
        await farmBossContract.methods
          .sellExactTokensForUnderlyingToken(
            this.web3.utils.toHex(this.fbSwapCallData),
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
        this.fbExecuteToken === 'usdc'
          ? this.farmBossUSDC
          : this.fbExecuteToken === 'eth'
          ? this.farmBossETH
          : this.farmBossWBTC;
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
            this.web3.utils.toHex(this.fbExecuteCallData)
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
