import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const storyId = Number(params.id);
  if (!Number.isInteger(storyId) || storyId <= 0) {
    return NextResponse.json({ message: 'Некорректная история' }, { status: 400 });
  }

  const body = (await req.json()) as { sourceUrl?: string };
  const sourceUrl = (body.sourceUrl ?? '').trim();
  if (!sourceUrl) {
    return NextResponse.json({ message: 'Укажите фото для истории' }, { status: 400 });
  }

  const item = await prisma.storyItem.create({
    data: { storyId, sourceUrl },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const storyId = Number(params.id);
  const itemId = Number(req.nextUrl.searchParams.get('itemId'));
  if (!Number.isInteger(storyId) || storyId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
  }

  await prisma.storyItem.deleteMany({
    where: { id: itemId, storyId },
  });
  return NextResponse.json({ ok: true });
}
