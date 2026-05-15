'use server';

import { prisma } from '@/prisma/prisma-client';
import { PayOrderTemplate } from '@/shared/components';
import { VerificationUserTemplate } from '@/shared/components/shared/email-temapltes/verification-user';
import { CheckoutFormValues } from '@/shared/constants';
import { calcCheckoutPricing } from '@/shared/lib/checkout-pricing';
import { sendEmail } from '@/shared/lib';
import { finalizePaidOrder } from '@/shared/lib/order-payment-success';
import { resolvePromoPercent, toDeliveryType } from '@/shared/lib/resolve-promo';
import { getUserSession } from '@/shared/lib/get-user-session';
import { FulfillmentStatus, OrderStatus, Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { cookies } from 'next/headers';
import { createTestPayment } from '@/shared/lib/test-payment';

export type CreateOrderResult = {
  paymentUrl: string | null;
  orderId: number;
};

export async function createOrder(data: CheckoutFormValues): Promise<CreateOrderResult> {
  try {
    const cookieStore = cookies();
    const cartToken = cookieStore.get('cartToken')?.value;

    if (!cartToken) {
      throw new Error('Cart token not found');
    }

    const session = await getUserSession();

    const userCart = await prisma.cart.findFirst({
      include: {
        user: true,
        items: {
          include: {
            ingredients: true,
            productItem: {
              include: {
                product: {
                  include: { ingredients: true },
                },
              },
            },
          },
        },
      },
      where: {
        token: cartToken,
      },
    });

    if (!userCart) {
      throw new Error('Cart not found');
    }

    if (userCart?.totalAmount === 0) {
      throw new Error('Cart is empty');
    }

    const deliveryType = toDeliveryType(data.deliveryType);
    const bonusToSpend = Math.max(0, Math.floor(data.bonusToSpend ?? 0));

    if (session && bonusToSpend > 0) {
      const u = await prisma.user.findFirst({ where: { id: Number(session.id) } });
      if (!u || u.bonusBalance < bonusToSpend) {
        throw new Error('Недостаточно бонусов');
      }
    }

    if (!session && bonusToSpend > 0) {
      throw new Error('Войдите, чтобы списать бонусы');
    }

    if (session && bonusToSpend > 0) {
      if (!userCart.userId || Number(session.id) !== userCart.userId) {
        throw new Error('Корзина принадлежит другому аккаунту');
      }
    }

    const { percent: promoPercent, promoId } = await resolvePromoPercent(data.promoCode, bonusToSpend);

    const pricing = calcCheckoutPricing({
      cartSubtotal: userCart.totalAmount,
      deliveryType,
      promoPercent,
      bonusToSpend,
    });

    const address =
      deliveryType === 'PICKUP'
        ? `Самовывоз: ${(data.pickupPoint ?? '').trim()}`
        : (data.address ?? '').trim();

    const scheduledForRaw =
      data.scheduledFor && data.scheduledFor.length > 0 ? new Date(data.scheduledFor) : null;
    const scheduledFor =
      scheduledForRaw && !Number.isNaN(scheduledForRaw.getTime()) ? scheduledForRaw : null;

    const sessionUserId = session ? Number(session.id) : NaN;
    const orderUserId =
      session && Number.isFinite(sessionUserId) && sessionUserId > 0
        ? sessionUserId
        : userCart.userId ?? undefined;

    const order = await prisma.order.create({
      data: {
        token: cartToken,
        fullName: data.firstName + ' ' + data.lastName,
        email: data.email,
        phone: data.phone,
        address,
        comment: data.comment,
        totalAmount: pricing.moneyToPay,
        status: OrderStatus.PENDING,
        items: JSON.parse(JSON.stringify(userCart.items)) as Prisma.InputJsonValue,
        userId: orderUserId,
        deliveryType,
        fulfillmentStatus: FulfillmentStatus.AWAITING_PAYMENT,
        scheduledFor,
        subtotalAmount: userCart.totalAmount,
        vatAmount: pricing.vatAmount,
        deliveryFee: pricing.deliveryFee,
        promoCodeId: promoId ?? undefined,
        promoPercentApplied: promoPercent,
        bonusSpent: pricing.bonusApplied,
      },
    });

    await prisma.cart.update({
      where: {
        id: userCart.id,
      },
      data: {
        totalAmount: 0,
      },
    });

    await prisma.cartItem.deleteMany({
      where: {
        cartId: userCart.id,
      },
    });

    if (pricing.moneyToPay === 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SUCCEEDED,
          paymentId: 'bonus-only',
        },
      });
      await finalizePaidOrder(order.id);
      return { paymentUrl: null, orderId: order.id };
    }

    // 🟢 ИСПРАВЛЕНО: используем тестовую оплату вместо ЮKassa
    const paymentData = await createTestPayment(pricing.moneyToPay, order.id);

    if (!paymentData) {
      throw new Error('Payment data not found');
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentId: paymentData.id,
      },
    });

    const paymentUrl = paymentData.confirmation.confirmation_url;

    try {
      await sendEmail(
        data.email,
        'Next Pizza / Оплатите заказ #' + order.id,
        PayOrderTemplate({
          orderId: order.id,
          totalAmount: pricing.moneyToPay,
          paymentUrl,
        }),
      );
    } catch (mailErr) {
      console.warn('[CreateOrder] Письмо не отправлено (оплата всё равно доступна):', mailErr);
    }

    return { paymentUrl, orderId: order.id };
  } catch (err) {
    console.log('[CreateOrder] Server error', err);
    throw err;
  }
}

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: Number(currentUser.id),
      },
    });

    await prisma.user.update({
      where: {
        id: Number(currentUser.id),
      },
      data: {
        fullName: body.fullName,
        email: body.email,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (err) {
    console.log('Error [UPDATE_USER]', err);
    throw err;
  }
}

export async function registerUser(body: Prisma.UserCreateInput) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user) {
      if (!user.verified) {
        throw new Error('Почта не подтверждена');
      }

      throw new Error('Пользователь уже существует');
    }

    const createdUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashSync(body.password, 10),
      },
    });

    const ref = cookies().get('referralCode')?.value;
    if (ref) {
      const inviter = await prisma.user.findUnique({
        where: { referralCode: ref },
      });
      if (inviter && inviter.id !== createdUser.id) {
        await prisma.user.update({
          where: { id: createdUser.id },
          data: { referredById: inviter.id },
        });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        code,
        userId: createdUser.id,
      },
    });

    await sendEmail(
      createdUser.email,
      'Next Pizza / 📝 Подтверждение регистрации',
      VerificationUserTemplate({
        code,
      }),
    );
  } catch (err) {
    console.log('Error [CREATE_USER]', err);
    throw err;
  }
}