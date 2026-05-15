import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { BuilderType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' },
    include: { category: true, items: { take: 3 }, ingredients: true },
    take: 200,
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as {
    name: string;
    imageUrl: string;
    categoryId: number;
    price: number;
    builderType?: string | null;
    ingredientIds?: number[];
  };

  if (!body.name || !body.imageUrl || !body.categoryId || !body.price) {
    return NextResponse.json({ message: 'Заполните поля' }, { status: 400 });
  }

  const builder =
    body.builderType === 'LEMONADE' ? BuilderType.LEMONADE : null;

  const ingredientIds = Array.isArray(body.ingredientIds) ? body.ingredientIds : [];

  const product = await prisma.product.create({
    data: {
      name: body.name,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
      disabled: false,
      builderType: builder,
      ...(ingredientIds.length
        ? { ingredients: { connect: ingredientIds.map((id) => ({ id })) } }
        : {}),
      items: {
        create: [{ price: Math.floor(body.price) }],
      },
    },
    include: { items: true, ingredients: true },
  });

  return NextResponse.json(product);
}
