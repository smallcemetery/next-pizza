import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const list = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, isOutOfStock: true },
  });
  return NextResponse.json(list);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as { ingredientId: number; isOutOfStock: boolean };

  const updated = await prisma.ingredient.update({
    where: { id: Number(body.ingredientId) },
    data: { isOutOfStock: Boolean(body.isOutOfStock) },
  });

  return NextResponse.json(updated);
}
