const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { covalentGetTokens } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

/* Note: there are LON staked tokens within the protocol, accounting for aprox $30M at current market price
 *  but the protocol itself are minting them...
 */
const LON_TOKEN = "0x0000000000095413afc295d19edeb1ad7b71c952";
const CONTRACT_FOR_STAKING = "0xf88506B0F1d30056B9e5580668D5875b9cd30F23";

// Used for grabbing AMM wrapper & PMM
const PERMANENT_STORAGE_PROXY = "0x6D9Cc14a1d36E6fF13fc6efA9e9326FcD12E7903";

const STAGES_STAKING_CONTRACTS = [
  //FIRST_STAGE
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0x929CF614C917944dD278BC2134714EaA4121BC6A",], 
  //SECOND_STAGE_LON_ETH
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0xc348314f74b043ff79396e14116b6f19122d69f4",], 
  //SECOND_STAGE_LON_USDT
  ["0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f", "0x11520d501e10e2e02a2715c4a9d3f8aeb1b72a7a",], 
  //THIRD_STAGE_LON_ETH
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0x74379CEC6a2c9Fde0537e9D9346222a724A278e4",], 
  //THIRD_STAGE_LON_USDT
  ["0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f", "0x539a67b6f9c3cad58f434cc12624b2d520bc03f8"], 
];

// Receives rewards/fee from AMM wrapper via reward distributor on WETH shape, some are sold for LON...
const MULTISIG_ONE = "0x74C3cA9431C009dC35587591Dc90780078174f8a";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ethTvl = async (timestamp, block) => {
  const amm_wrapper_addr = (
    await sdk.api.abi.call({
      abi: abi.ammWrapperAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;


  const pmm_addr = (
    await sdk.api.abi.call({
      abi: abi.pmmAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;

  const [ tokens_amm, tokens_pmm] = await Promise.all([covalentGetTokens(amm_wrapper_addr), covalentGetTokens(pmm_addr)])
  const toa = []
  tokens_amm.forEach(t => toa.push([t.contract_address, amm_wrapper_addr]))
  tokens_pmm.forEach(t => toa.push([t.contract_address, pmm_addr]))

  return sumTokens2({ tokensAndOwners: toa, block, });
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(CONTRACT_FOR_STAKING, LON_TOKEN),
    pool2: (_, block) => sumTokens2({ tokensAndOwners: STAGES_STAKING_CONTRACTS, block, resolveLP: true }),
    treasury: (_, block) => sumTokens2({ owner: MULTISIG_ONE, tokens: [
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
      '0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f',
    ], block, }),
  },
  
};
