import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const list = await prisma.promoCode.findMany({ orderBy: { id: 'desc' }, take: 200 });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as {
    code: string;
    percentOff: number;
    maxUses?: number | null;
  };

  const code = body.code.trim().toUpperCase();
  if (!code || ![5, 10, 15].includes(body.percentOff)) {
    return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
  }

  const created = await prisma.promoCode.create({
    data: {
      code,
      percentOff: body.percentOff,
      maxUses: body.maxUses ?? null,
      active: true,
    },
  });

  return NextResponse.json(created);
}
