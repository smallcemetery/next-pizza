import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const stories = await prisma.story.findMany({
    orderBy: { id: 'desc' },
    include: { items: { orderBy: { id: 'asc' } } },
    take: 100,
  });

  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as { previewImageUrl?: string };
  const previewImageUrl = (body.previewImageUrl ?? '').trim();
  if (!previewImageUrl) {
    return NextResponse.json({ message: 'Укажите фото превью' }, { status: 400 });
  }

  const story = await prisma.story.create({
    data: { previewImageUrl },
    include: { items: true },
  });
  return NextResponse.json(story);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as { id?: number; previewImageUrl?: string };
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Некорректная история' }, { status: 400 });
  }
  const previewImageUrl = (body.previewImageUrl ?? '').trim();
  if (!previewImageUrl) {
    return NextResponse.json({ message: 'Укажите фото превью' }, { status: 400 });
  }

  const updated = await prisma.story.update({
    where: { id },
    data: { previewImageUrl },
    include: { items: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Некорректная история' }, { status: 400 });
  }

  await prisma.storyItem.deleteMany({ where: { storyId: id } });
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
