import { DeliveryType } from '@prisma/client';

export const VAT_PERCENT = 15;
export const DELIVERY_PRICE_RUB = 250;
export const DEFAULT_BONUS_PERCENT = 10;

export type PricingInput = {
  cartSubtotal: number;
  deliveryType: DeliveryType;
  promoPercent: number; // 0, 5, 10, 15 — 0 если списываются бонусы
  bonusToSpend: number;
};

export type PricingResult = {
  subtotalAfterPromo: number;
  promoDiscount: number;
  vatAmount: number;
  deliveryFee: number;
  grossBeforeBonus: number;
  bonusApplied: number;
  moneyToPay: number;
};

export function calcCheckoutPricing(input: PricingInput): PricingResult {
  const { cartSubtotal, deliveryType, promoPercent, bonusToSpend } = input;

  const promoDiscount = promoPercent > 0 ? Math.round((cartSubtotal * promoPercent) / 100) : 0;
  const subtotalAfterPromo = Math.max(0, cartSubtotal - promoDiscount);

  const vatAmount = Math.round((subtotalAfterPromo * VAT_PERCENT) / 100);
  const deliveryFee = deliveryType === 'DELIVERY' ? DELIVERY_PRICE_RUB : 0;
  const grossBeforeBonus = subtotalAfterPromo + deliveryFee + vatAmount;

  const bonusApplied = Math.min(Math.max(0, bonusToSpend), grossBeforeBonus);
  const moneyToPay = Math.max(0, grossBeforeBonus - bonusApplied);

  return {
    subtotalAfterPromo,
    promoDiscount,
    vatAmount,
    deliveryFee,
    grossBeforeBonus,
    bonusApplied,
    moneyToPay,
  };
}

export function randomAdvanceDelayMs(): number {
  const min = 5 * 60 * 1000;
  const max = 15 * 60 * 1000;
  return min + Math.floor(Math.random() * (max - min));
}
