// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {BigNumber, providers, utils} from 'ethers';

const FALLBACK_PRIORITY_FEE = utils.parseUnits('30', 'gwei');

// `maxFeePerGas` is a ceiling, not a charge -- the transaction still costs
// `baseFee + priority` -- but a node requires the sender to cover the ceiling
// in full before it will even estimate gas. Headroom therefore trades
// resilience to a rising base fee against how much the miner has to hold, so
// keep it modest rather than the usual 2x.
const BASE_FEE_HEADROOM_PERCENT = 125;

// Polygon's bor node rejects transactions with priority fee below ~25 gwei
// as underpriced, even when eth_maxPriorityFeePerGas suggests a lower value.
const MIN_PRIORITY_FEE_BY_CHAIN: Record<number, BigNumber> = {
  137: utils.parseUnits('30', 'gwei'),
  80001: utils.parseUnits('30', 'gwei'),
  80002: utils.parseUnits('30', 'gwei'),
};

/**
 * ethers v5 does not ask the node for this. `getFeeData` returns a hardcoded
 * 1.5 gwei on any EIP-1559 chain, which is roughly right for mainnet and wildly
 * wrong for an L2: Base suggests 0.001 gwei, so the constant overpays by three
 * orders of magnitude.
 */
async function suggestedPriorityFee(
  provider: providers.Provider,
): Promise<BigNumber | null> {
  try {
    const suggested = await (
      provider as providers.JsonRpcProvider
    ).send('eth_maxPriorityFeePerGas', []);
    return BigNumber.from(suggested);
  } catch {
    return null;
  }
}

export async function resolveMaxPriorityFeePerGas(
  provider: providers.Provider,
  feeData: providers.FeeData,
): Promise<BigNumber> {
  const {chainId} = await provider.getNetwork();
  const floor = MIN_PRIORITY_FEE_BY_CHAIN[chainId] ?? BigNumber.from(0);
  const fromProvider =
    (await suggestedPriorityFee(provider)) ?? feeData.maxPriorityFeePerGas;

  if (!fromProvider) {
    return floor.gt(0) ? floor : FALLBACK_PRIORITY_FEE;
  }
  return fromProvider.gt(floor) ? fromProvider : floor;
}

/**
 * Built from the pending block's base fee rather than `getGasPrice()`, which
 * already bundles a priority estimate of its own -- adding a priority fee on
 * top of it charges for the same thing twice.
 */
export async function resolveMaxFeePerGas(
  provider: providers.Provider,
  maxPriorityFeePerGas: BigNumber,
): Promise<BigNumber> {
  const block = await provider.getBlock('latest');
  if (!block?.baseFeePerGas) {
    // Pre-EIP-1559 chain: the gas price is the whole fee.
    return await provider.getGasPrice();
  }
  return block.baseFeePerGas
    .mul(BASE_FEE_HEADROOM_PERCENT)
    .div(100)
    .add(maxPriorityFeePerGas);
}
