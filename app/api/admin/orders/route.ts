import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      promoCode: { select: { code: true } },
    },
  });

  return NextResponse.json(orders);
}
