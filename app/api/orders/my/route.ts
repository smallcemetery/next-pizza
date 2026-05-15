import { prisma } from '@/prisma/prisma-client';
import { advanceOrdersAuto } from '@/shared/lib/order-payment-success';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ message: 'Сессия повреждена: нет id пользователя' }, { status: 401 });
  }

  await advanceOrdersAuto();

  const email = session.user.email?.trim();
  const where: Prisma.OrderWhereInput = {
    OR: [
      { userId },
      ...(email
        ? [{ userId: null, email: { equals: email, mode: 'insensitive' as const } }]
        : []),
    ],
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      totalAmount: true,
      status: true,
      fulfillmentStatus: true,
      deliveryType: true,
      createdAt: true,
      scheduledFor: true,
      paidAt: true,
    },
  });

  return NextResponse.json(orders);
}
