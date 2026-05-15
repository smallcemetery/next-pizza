import { prisma } from '@/prisma/prisma-client';
import { updateCartTotalAmount } from '@/shared/lib/update-cart-total-amount';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const data = (await req.json()) as { quantity: number };
    const token = req.cookies.get('cartToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Cart token not found' }, { status: 401 });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    const quantity = Math.floor(Number(data.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          token,
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    const updatedUserCart = await updateCartTotalAmount(token);

    return NextResponse.json(updatedUserCart);
  } catch (error) {
    console.log('[CART_PATCH] Server error', error);
    return NextResponse.json({ message: 'Не удалось обновить корзину' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const token = req.cookies.get('cartToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Cart token not found' }, { status: 401 });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid cart item id' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          token,
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    const updatedUserCart = await updateCartTotalAmount(token);

    return NextResponse.json(updatedUserCart);
  } catch (error) {
    console.log('[CART_DELETE] Server error', error);
    return NextResponse.json({ message: 'Не удалось удалить корзину' }, { status: 500 });
  }
}
