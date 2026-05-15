import { prisma } from '@/prisma/prisma-client';
import { findOrCreateCart } from '@/shared/lib/find-or-create-cart';
import { updateCartTotalAmount } from '@/shared/lib/update-cart-total-amount';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

async function randomItemFromCategory(categoryId: number) {
  const items = await prisma.productItem.findMany({
    where: {
      product: { categoryId, disabled: false },
    },
    take: 40,
    orderBy: { id: 'desc' },
  });
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('cartToken')?.value;
    if (!token) {
      token = randomUUID();
    }

    const hot = await randomItemFromCategory(1);
    const side = await randomItemFromCategory(3);
    const drink = await randomItemFromCategory(5);
    if (!hot || !side || !drink) {
      return NextResponse.json({ message: 'Недостаточно позиций в меню' }, { status: 400 });
    }

    const userCart = await findOrCreateCart(token);

    for (const pi of [side, hot, drink]) {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productItemId: pi.id,
          quantity: 1,
        },
      });
    }

    const updated = await updateCartTotalAmount(token);
    const res = NextResponse.json({
      ok: true,
      discountHint: 'Скидка «Удачи» 5% применится промокодом LUCKYLUNCH на странице оплаты (введите вручную).',
      cart: updated,
    });
    if (!req.cookies.get('cartToken')?.value) {
      res.cookies.set('cartToken', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      });
    }
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Ошибка' }, { status: 500 });
  }
}
