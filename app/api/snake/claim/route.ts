import { prisma } from '@/prisma/prisma-client';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const body = (await req.json()) as { orderId: number; apples: number };
  const orderId = Number(body.orderId);
  const apples = Math.min(50, Math.max(0, Math.floor(Number(body.apples))));

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ message: 'Некорректный номер заказа' }, { status: 400 });
  }
  if (!Number.isFinite(apples) || apples < 1 || apples > 50) {
    return NextResponse.json({ message: 'Некорректное количество яблок (от 1 до 50)' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: Number(session.user.id),
      status: OrderStatus.SUCCEEDED,
    },
  });

  if (!order) {
    return NextResponse.json({ message: 'Заказ не найден' }, { status: 404 });
  }

  if (order.snakePlayed) {
    return NextResponse.json({ message: 'Бонус за эту игру уже получен' }, { status: 400 });
  }

  const bonus = apples;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { bonusBalance: { increment: bonus } },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { snakePlayed: true, snakeBonusEarned: bonus },
    }),
  ]);

  return NextResponse.json({ bonus });
}
