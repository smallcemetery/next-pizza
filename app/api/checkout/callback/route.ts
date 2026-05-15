import { PaymentCallbackData } from '@/@types/yookassa';
import { prisma } from '@/prisma/prisma-client';
import { OrderSuccessTemplate } from '@/shared/components/shared/email-temapltes/order-success';
import { sendEmail } from '@/shared/lib';
import { finalizePaidOrder } from '@/shared/lib/order-payment-success';
import { CartItemDTO } from '@/shared/services/dto/cart.dto';
import { FulfillmentStatus, OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentCallbackData;

    const order = await prisma.order.findFirst({
      where: {
        id: Number(body.object.metadata.order_id),
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isSucceeded = body.object.status === 'succeeded';

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: isSucceeded ? OrderStatus.SUCCEEDED : OrderStatus.CANCELLED,
        ...(!isSucceeded ? { fulfillmentStatus: FulfillmentStatus.CANCELLED } : {}),
      },
    });

    const items = JSON.parse(order?.items as string) as CartItemDTO[];

    if (isSucceeded) {
      await finalizePaidOrder(order.id);
      await sendEmail(
        order.email,
        'Next Pizza / Ваш заказ успешно оформлен 🎉',
        OrderSuccessTemplate({ orderId: order.id, items }),
      );
    } else {
      // Письмо о неуспешной оплате
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log('[Checkout Callback] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
