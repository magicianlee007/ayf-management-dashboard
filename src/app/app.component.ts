import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IB3CRV_GAUGE,
  USDC,
  FarmBoss_USDC,
  IBETH,
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
} from '../constants/contractAddresses';
import crvGauge from '../constants/crvGauge.json';
import usdc from '../constants/usdc.json';
import balanceABI from '../constants/BalanceOfABI.json';
import farmTreasury from '../constants/FarmTreasury.json';
import crvIbPool from '../constants/crvIbPool.json';

let Web3: any;
const COIN_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,compound-wrapped-btc,interest-bearing-eth,idle,curve-dao-token&vs_currencies=usd';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ayf-management-dashboard';
  web3: any;
  // stableSwap
  crvIbPool: any;
  // usdc reward token contract
  ib3CRV_GAUGE: any;
  usdc: any;

  // eth reward token contract
  ibETH: any;
  wETH: any;
  eCRV_GAUGE: any;

  // wbtc reward contract
  wBTC: any;
  compound_BTC: any;
  stack_ETH: any;
  hCrvGauge: any;

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
  };
  fbETH_Balance = {
    wETH: 0,
    eCRV_Gauge: 0,
    ibETH: 0,
    totalValue: 0,
    unclaimedCrv: 0,
    uncalimedTotalValue: 0,
  };
  fbWBTC_Balance = {
    wBTC: 0,
    compound_WBTC: 0,
    stack_ETH: 0,
    totalValue: 0,
    unclaimedCrv: 0,
    hCrvGauge: 0,
  };

  ftUSDC_Balance = { usdc: 0, aum: 0 };
  ftWETH_Balance = { wETH: 0, aum: 0 };
  ftWBTC_Balance = { wBTC: 0, aum: 0 };
  crvVirtualPrice = 0;

  constructor(private http: HttpClient) {
    if (!window['Web3']) {
      this.injectScript();
    } else {
      this.generateProvider();
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
    // Create crvStableSwap contract
    this.crvIbPool = new this.web3.eth.Contract(crvIbPool, CRV_IB_POOL);
    const virtualPriceWei = await this.crvIbPool.methods
      .get_virtual_price()
      .call();
    this.crvVirtualPrice = this.web3.utils.fromWei(virtualPriceWei);
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
    this.fbUSDC_Balance.unclaimedCrv = this.web3.utils.fromWei(
      crvUnclaimedRewards
    );

    this.fbUSDC_Balance.totalValue =
      this.fbUSDC_Balance.usdc * this.usdcPrice +
      this.fbUSDC_Balance.ib3CRV_Gauge * this.usdcPrice;
    // Get unclaimed total value
    this.fbUSDC_Balance.unclaimedTotalValue =
      this.fbUSDC_Balance.unclaimedCrv * this.crvPrice;

    // Get the balance of FarmBoss_ETH
    this.ibETH = new this.web3.eth.Contract(balanceABI, IBETH);
    const ibEthBalanceWei = await this.ibETH.methods
      .balanceOf(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.ibETH = this.web3.utils.fromWei(ibEthBalanceWei);

    this.wETH = new this.web3.eth.Contract(balanceABI, WETH);
    const wEthBalanceWei = await this.wETH.methods
      .balanceOf(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.wETH = this.web3.utils.fromWei(wEthBalanceWei);

    this.eCRV_GAUGE = new this.web3.eth.Contract(crvGauge, ECRV_GAUGE);
    const eCrvGaugeBalanceWei = await this.eCRV_GAUGE.methods
      .balanceOf(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.eCRV_Gauge = this.web3.utils.fromWei(
      eCrvGaugeBalanceWei
    );

    const unclaimedCrvEthWei = await this.eCRV_GAUGE.methods
      .claimable_tokens(FarmBoss_ETH)
      .call();
    this.fbETH_Balance.unclaimedCrv = this.web3.utils.fromWei(
      unclaimedCrvEthWei
    );

    this.fbETH_Balance.totalValue =
      this.fbETH_Balance.ibETH * this.ibETHPrice +
      this.fbETH_Balance.eCRV_Gauge * this.ethPrice +
      this.fbETH_Balance.wETH * this.ethPrice;

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
    this.fbWBTC_Balance.unclaimedCrv = this.web3.utils.fromWei(
      unclaimedCrvWbtcWei
    );
    this.fbWBTC_Balance.totalValue =
      this.fbWBTC_Balance.compound_WBTC * this.compoundBTCPrice +
      this.fbWBTC_Balance.wBTC * this.wBTCPrice +
      this.fbWBTC_Balance.hCrvGauge * this.wBTCPrice;

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
}
