import { prisma } from '@/prisma/prisma-client';
import { finalizePaidOrder } from '@/shared/lib/order-payment-success';
import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: number };
    const orderId = Number(body.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ message: 'Некорректный номер заказа' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ message: 'Заказ не найден' }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SUCCEEDED,
        paymentId: order.paymentId ?? `mock_${orderId}_${Date.now()}`,
      },
    });

    await finalizePaidOrder(orderId);
    return NextResponse.json({ redirectUrl: `/?paid=1&orderId=${orderId}&snake=1` });
  } catch (error) {
    console.log('[MOCK_PAYMENT_CONFIRM] Error', error);
    return NextResponse.json({ message: 'Не удалось подтвердить оплату' }, { status: 500 });
  }
}
