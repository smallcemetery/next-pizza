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
    disabled?: boolean;
    name?: string;
    imageUrl?: string;
    categoryId?: number;
    price?: number;
    ingredientIds?: number[];
  };

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(typeof body.disabled === 'boolean' ? { disabled: body.disabled } : {}),
      ...(body.name ? { name: body.name } : {}),
      ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      ...(body.categoryId ? { categoryId: body.categoryId } : {}),
      ...(body.ingredientIds !== undefined
        ? {
            ingredients: {
              set: body.ingredientIds.map((i) => ({ id: i })),
            },
          }
        : {}),
    },
  });

  if (typeof body.price === 'number' && Number.isFinite(body.price)) {
    const first = await prisma.productItem.findFirst({
      where: { productId: id },
      orderBy: { id: 'asc' },
    });
    if (first) {
      await prisma.productItem.update({
        where: { id: first.id },
        data: { price: Math.max(0, Math.floor(body.price)) },
      });
    }
  }

  return NextResponse.json(product);
}
