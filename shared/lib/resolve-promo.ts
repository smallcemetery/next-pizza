import { prisma } from '@/prisma/prisma-client';
import { DeliveryType } from '@prisma/client';

export async function resolvePromoPercent(
  rawCode: string | undefined | null,
  bonusToSpend: number,
): Promise<{ percent: number; promoId: number | null }> {
  if (bonusToSpend > 0) {
    return { percent: 0, promoId: null };
  }

  const trimmed = rawCode?.trim();
  if (!trimmed) {
    return { percent: 0, promoId: null };
  }

  const promo = await prisma.promoCode.findFirst({
    where: {
      code: trimmed.toUpperCase(),
      active: true,
    },
  });

  if (!promo) {
    return { percent: 0, promoId: null };
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { percent: 0, promoId: null };
  }

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { percent: 0, promoId: null };
  }

  if (![5, 10, 15].includes(promo.percentOff)) {
    return { percent: 0, promoId: null };
  }

  return { percent: promo.percentOff, promoId: promo.id };
}

export function toDeliveryType(v: string): DeliveryType {
  return v === 'PICKUP' ? DeliveryType.PICKUP : DeliveryType.DELIVERY;
}
