import { prisma } from '@/prisma/prisma-client';
import {
  AchievementType,
  DeliveryType,
  FulfillmentStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { getAccrualBonusPercent } from './happy-hour';
import { randomAdvanceDelayMs } from './checkout-pricing';
import { parseOrderItems } from './parse-order-items';

export function followingFulfillmentStatus(
  current: FulfillmentStatus,
  delivery: DeliveryType,
): FulfillmentStatus | null {
  if (delivery === DeliveryType.DELIVERY) {
    switch (current) {
      case FulfillmentStatus.PAID:
        return FulfillmentStatus.IN_PROGRESS;
      case FulfillmentStatus.IN_PROGRESS:
        return FulfillmentStatus.WAITING_COURIER;
      case FulfillmentStatus.WAITING_COURIER:
        return FulfillmentStatus.DELIVERING;
      case FulfillmentStatus.DELIVERING:
        return FulfillmentStatus.COMPLETED;
      default:
        return null;
    }
  }

  switch (current) {
    case FulfillmentStatus.PAID:
      return FulfillmentStatus.IN_PROGRESS;
    case FulfillmentStatus.IN_PROGRESS:
      return FulfillmentStatus.READY_FOR_PICKUP;
    case FulfillmentStatus.READY_FOR_PICKUP:
      return FulfillmentStatus.COMPLETED;
    default:
      return null;
  }
}

async function grantAchievement(
  tx: Prisma.TransactionClient,
  userId: number,
  type: AchievementType,
) {
  await tx.userAchievement.upsert({
    where: { userId_type: { userId, type } },
    create: { userId, type },
    update: {},
  });
}

export async function finalizePaidOrder(orderId: number) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { user: true, promoCode: true },
    });

    if (!order || order.status !== OrderStatus.SUCCEEDED) {
      return;
    }

    if (order.paidAt) {
      return;
    }

    const paidAt = new Date();
    const items = parseOrderItems(order.items);

    const happy = await tx.happyHourConfig.findUnique({ where: { id: 1 } });
    const { percent: bonusPercent } = getAccrualBonusPercent(paidAt, happy);

    const promoDiscount =
      order.promoPercentApplied > 0
        ? Math.round((order.subtotalAmount * order.promoPercentApplied) / 100)
        : 0;
    const baseForBonus = Math.max(0, order.subtotalAmount - promoDiscount);
    const earned = Math.floor((baseForBonus * bonusPercent) / 100) + order.snakeBonusEarned;

    if (order.userId && order.user) {
      const delta = earned - order.bonusSpent;
      await tx.user.update({
        where: { id: order.userId },
        data: { bonusBalance: { increment: delta } },
      });

      const succeededCount = await tx.order.count({
        where: { userId: order.userId, status: OrderStatus.SUCCEEDED },
      });

      if (succeededCount === 1) {
        await grantAchievement(tx, order.userId, AchievementType.FIRST_ORDER);
      }

      const categoryIds = new Set<number>();
      const prevOrders = await tx.order.findMany({
        where: { userId: order.userId, status: OrderStatus.SUCCEEDED },
        select: { id: true, items: true },
      });
      for (const o of prevOrders) {
        const arr = parseOrderItems(o.items);
        for (const it of arr) {
          categoryIds.add(it.productItem.product.categoryId);
        }
      }
      if (categoryIds.size >= 5) {
        await grantAchievement(tx, order.userId, AchievementType.GOURMET_ALL_CATEGORIES);
      }

      const hour = paidAt.getHours();
      if (hour >= 23 || hour < 6) {
        await grantAchievement(tx, order.userId, AchievementType.NIGHT_OWL);
      } else if (hour >= 6 && hour < 10) {
        await grantAchievement(tx, order.userId, AchievementType.EARLY_BIRD);
      }

      if (order.user.referredById) {
        const friendPrior = await tx.order.count({
          where: {
            userId: order.userId,
            status: OrderStatus.SUCCEEDED,
            id: { not: order.id },
          },
        });
        if (friendPrior === 0) {
          await grantAchievement(tx, order.user.referredById, AchievementType.FACTORY_FRIEND);
          await tx.user.update({
            where: { id: order.user.referredById },
            data: { bonusBalance: { increment: 300 } },
          });
        }
      }
    }

    if (order.promoCodeId) {
      await tx.promoCode.update({
        where: { id: order.promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        bonusEarned: earned,
        fulfillmentStatus: FulfillmentStatus.PAID,
        nextAutoAdvanceAt: new Date(Date.now() + randomAdvanceDelayMs()),
        paidAt,
      },
    });
  });
}

export async function advanceOrdersAuto() {
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.SUCCEEDED,
      autoProgressEnabled: true,
      nextAutoAdvanceAt: { lte: now },
      fulfillmentStatus: {
        notIn: [
          FulfillmentStatus.COMPLETED,
          FulfillmentStatus.CANCELLED,
          FulfillmentStatus.AWAITING_PAYMENT,
        ],
      },
    },
  });

  for (const order of orders) {
    const next = followingFulfillmentStatus(order.fulfillmentStatus, order.deliveryType);
    if (!next) {
      await prisma.order.update({
        where: { id: order.id },
        data: { nextAutoAdvanceAt: null },
      });
      continue;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: next,
        nextAutoAdvanceAt:
          next === FulfillmentStatus.COMPLETED
            ? null
            : new Date(Date.now() + randomAdvanceDelayMs()),
      },
    });
  }

  return orders.length;
}
