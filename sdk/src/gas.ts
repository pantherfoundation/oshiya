// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2024 Panther Protocol Foundation

import {BigNumber, providers, utils} from 'ethers';

const FALLBACK_PRIORITY_FEE = utils.parseUnits('30', 'gwei');

// Polygon's bor node rejects transactions with priority fee below ~25 gwei
// as underpriced, even when eth_maxPriorityFeePerGas suggests a lower value.
const MIN_PRIORITY_FEE_BY_CHAIN: Record<number, BigNumber> = {
  137: utils.parseUnits('30', 'gwei'),
  80001: utils.parseUnits('30', 'gwei'),
  80002: utils.parseUnits('30', 'gwei'),
};

export async function resolveMaxPriorityFeePerGas(
  provider: providers.Provider,
  feeData: providers.FeeData,
): Promise<BigNumber> {
  const {chainId} = await provider.getNetwork();
  const floor = MIN_PRIORITY_FEE_BY_CHAIN[chainId] ?? BigNumber.from(0);
  const fromProvider = feeData.maxPriorityFeePerGas;

  if (!fromProvider) {
    return floor.gt(0) ? floor : FALLBACK_PRIORITY_FEE;
  }
  return fromProvider.gt(floor) ? fromProvider : floor;
}
