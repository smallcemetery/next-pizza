import { prisma } from '@/prisma/prisma-client';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const orderId = Number(req.nextUrl.searchParams.get('orderId'));
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ canPlay: false }, { status: 200 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: Number(session.user.id),
      status: OrderStatus.SUCCEEDED,
    },
    select: { snakePlayed: true },
  });

  if (!order) {
    return NextResponse.json({ canPlay: false }, { status: 200 });
  }

  return NextResponse.json({ canPlay: !order.snakePlayed }, { status: 200 });
}
