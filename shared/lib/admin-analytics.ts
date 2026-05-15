import { prisma } from '@/prisma/prisma-client';
import { OrderStatus } from '@prisma/client';
import { parseOrderItems } from '@/shared/lib/parse-order-items';

export async function getAdminAnalytics() {
  try {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.SUCCEEDED,
      createdAt: { gte: weekAgo },
    },
    select: { items: true, totalAmount: true, promoCodeId: true },
  });

  const productCounts = new Map<number, { name: string; count: number }>();
  let sum = 0;
  let n = 0;
  const promoUses = new Map<number, number>();

  for (const o of recentOrders) {
    sum += o.totalAmount;
    n += 1;
    if (o.promoCodeId) {
      promoUses.set(o.promoCodeId, (promoUses.get(o.promoCodeId) ?? 0) + 1);
    }
    const items = parseOrderItems(o.items) as {
      productItem?: { productId?: number; product?: { name?: string } };
    }[];
    for (const row of items) {
      const pid = row.productItem?.productId;
      const name = row.productItem?.product?.name ?? 'Товар';
      if (!pid) continue;
      const cur = productCounts.get(pid) ?? { name, count: 0 };
      cur.count += 1;
      productCounts.set(pid, cur);
    }
  }

  let top: { name: string; count: number } | null = null;
  for (const v of Array.from(productCounts.values())) {
    if (!top || v.count > top.count) top = v;
  }

  let topPromo: { code: string; uses: number } | null = null;
  for (const [id, uses] of Array.from(promoUses.entries())) {
    const p = await prisma.promoCode.findUnique({ where: { id } });
    if (!p) continue;
    if (!topPromo || uses > topPromo.uses) {
      topPromo = { code: p.code, uses };
    }
  }

  return {
    popularWeek: top,
    avgCheck: n ? Math.round(sum / n) : 0,
    topPromo,
    ordersWeek: n,
  };
  } catch (e) {
    console.error('[getAdminAnalytics]', e);
    return {
      popularWeek: null,
      avgCheck: 0,
      topPromo: null,
      ordersWeek: 0,
    };
  }
}
