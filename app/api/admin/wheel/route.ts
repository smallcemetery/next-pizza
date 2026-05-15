import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });

  const list = await prisma.wheelPrize.findMany({ orderBy: { id: 'desc' } });
  const totalChance = list.reduce((acc, item) => acc + item.chanceBasis, 0);
  return NextResponse.json({ list, totalChance });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });

  const body = (await req.json()) as {
    title?: string;
    rewardType?: string;
    value?: string;
    chanceBasis?: number;
  };
  const title = (body.title ?? '').trim();
  const rewardType = (body.rewardType ?? '').trim();
  const value = (body.value ?? '').trim();
  const chanceBasis = Math.max(1, Math.floor(Number(body.chanceBasis) || 0));
  if (!title || !rewardType || !value) {
    return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
  }

  const created = await prisma.wheelPrize.create({
    data: { title, rewardType, value, chanceBasis },
  });
  return NextResponse.json(created);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });

  const body = (await req.json()) as { id?: number; chanceBasis?: number; active?: boolean };
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Некорректный id' }, { status: 400 });
  }

  const updated = await prisma.wheelPrize.update({
    where: { id },
    data: {
      ...(body.chanceBasis ? { chanceBasis: Math.max(1, Math.floor(body.chanceBasis)) } : {}),
      ...(typeof body.active === 'boolean' ? { active: body.active } : {}),
    },
  });
  return NextResponse.json(updated);
}
