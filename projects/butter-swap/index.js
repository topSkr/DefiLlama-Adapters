const sdk = require('@defillama/sdk');
const  BUTTER = ' ';




async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'eth',
    target: BUTTER,
    params: [],
    block: chainBlocks['eth'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `eth:{MINT_TOKEN_CONTRACT}`, collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Statistics contract erc20 token.',
  start: 1025235,
  eth: {
    tvl,
  }
}; 