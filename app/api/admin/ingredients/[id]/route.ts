import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const id = Number(params.id);
  const body = (await req.json()) as {
    name?: string;
    price?: number;
    imageUrl?: string;
  };

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(typeof body.price === 'number' ? { price: Math.max(0, Math.floor(body.price)) } : {}),
      ...(body.imageUrl ? { imageUrl: body.imageUrl.trim() } : {}),
    },
  });

  return NextResponse.json(ingredient);
}
