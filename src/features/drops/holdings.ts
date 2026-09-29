import type { Drop } from '@/types/domain';

export interface Holdings {
  dropCount: number;
  /** Sum of `quantity` over every drop of the item. */
  quantity: number;
  /** Σ quantity × per-unit acquisition value, over drops that recorded one; null if none did. */
  acquisitionValueUsd: number | null;
  /** Drops with no recorded acquisition value (excluded from the sum above, never counted as $0). */
  dropsWithoutAcquisitionValue: number;
  /** Σ quantity × per-unit current price; null when there is no price (never $0). */
  currentValueUsd: number | null;
}

const toCents = (value: number) => Math.round(value * 100) / 100;

/**
 * `acquisitionValueUsd` / `currentValueUsd` on a drop are both per-unit (see `DropResponse.java`),
 * so each is multiplied by that drop's quantity before summing.
 */
export function aggregateHoldings(drops: Drop[]): Holdings {
  let quantity = 0;
  let acquisition = 0;
  let acquisitionKnown = 0;
  let current = 0;
  let allPriced = drops.length > 0;

  for (const drop of drops) {
    quantity += drop.quantity;
    if (drop.acquisitionValueUsd !== null) {
      acquisition += drop.quantity * drop.acquisitionValueUsd;
      acquisitionKnown += 1;
    }
    if (drop.priceAvailable && drop.currentValueUsd !== null) {
      current += drop.quantity * drop.currentValueUsd;
    } else {
      allPriced = false;
    }
  }

  return {
    dropCount: drops.length,
    quantity,
    acquisitionValueUsd: acquisitionKnown > 0 ? toCents(acquisition) : null,
    dropsWithoutAcquisitionValue: drops.length - acquisitionKnown,
    currentValueUsd: allPriced ? toCents(current) : null,
  };
}
