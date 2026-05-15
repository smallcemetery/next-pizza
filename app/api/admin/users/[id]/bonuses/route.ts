import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const userId = Number(params.id);
  const body = (await req.json()) as { amount: number };
  const amount = Math.floor(Number(body.amount));
  if (!amount) {
    return NextResponse.json({ message: 'Укажите сумму' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { bonusBalance: { increment: amount } },
    select: { id: true, bonusBalance: true, fullName: true },
  });

  return NextResponse.json(user);
}
