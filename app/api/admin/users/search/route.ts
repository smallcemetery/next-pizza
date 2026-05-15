import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q) {
    return NextResponse.json([]);
  }

  const idNum = Number(q);
  const byOrder =
    !Number.isNaN(idNum) && idNum > 0
      ? await prisma.order.findMany({
          where: { id: idNum },
          select: { userId: true },
        })
      : [];

  const userIdsFromOrders = byOrder.map((o) => o.userId).filter(Boolean) as number[];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: q } },
        { email: { contains: q } },
        ...(userIdsFromOrders.length ? [{ id: { in: userIdsFromOrders } }] : []),
      ],
    },
    take: 20,
    select: {
      id: true,
      fullName: true,
      email: true,
      bonusBalance: true,
      referralCode: true,
    },
  });

  return NextResponse.json(users);
}
