import { prisma } from '@/prisma/prisma-client';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const list = await prisma.userAchievement.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(list);
}
