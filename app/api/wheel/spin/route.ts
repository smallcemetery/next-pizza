import { prisma } from '@/prisma/prisma-client';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findOrCreateCart } from '@/shared/lib/find-or-create-cart';
import { updateCartTotalAmount } from '@/shared/lib/update-cart-total-amount';

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function POST() {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  }

  const now = new Date();
  if (user.lastWheelSpinAt && isSameCalendarDay(user.lastWheelSpinAt, now)) {
    return NextResponse.json({ message: 'Колесо доступно раз в сутки' }, { status: 400 });
  }

  let prizes = await prisma.wheelPrize.findMany({
    where: { active: true },
    orderBy: { id: 'asc' },
  });
  if (prizes.length === 0) {
    await prisma.wheelPrize.createMany({
      data: [
        { title: 'Бесплатная пицца', rewardType: 'free_pizza', value: '1', chanceBasis: 100 },
        { title: '100 бонусов', rewardType: 'bonus', value: '100', chanceBasis: 2000 },
        { title: 'Промо 10%', rewardType: 'promo', value: '10', chanceBasis: 7900 },
      ],
    });
    prizes = await prisma.wheelPrize.findMany({ where: { active: true } });
  }

  const total = prizes.reduce((acc, p) => acc + p.chanceBasis, 0);
  const roll = Math.floor(Math.random() * Math.max(total, 1));
  let cursor = 0;
  let selected = prizes[0];
  let sliceIndex = 0;
  for (let i = 0; i < prizes.length; i++) {
    const prize = prizes[i];
    cursor += prize.chanceBasis;
    if (roll < cursor) {
      selected = prize;
      sliceIndex = i;
      break;
    }
  }

  let rewardType = selected.rewardType;
  let value = selected.value;
  let message = selected.title;

  if (selected.rewardType === 'bonus') {
    const bonus = Math.max(1, Number(selected.value) || 0);
    await prisma.user.update({ where: { id: userId }, data: { bonusBalance: { increment: bonus } } });
    value = String(bonus);
    message = `+${bonus} бонусов на счёт`;
  }
  if (selected.rewardType === 'promo') {
    message = `Промо-награда: ${selected.value}%`;
  }
  if (selected.rewardType === 'free_pizza') {
    message = 'Вы выиграли бесплатную пиццу! Активируйте награду в профиле.';
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastWheelSpinAt: now },
  });

  await prisma.wheelReward.create({
    data: {
      userId,
      rewardType,
      value,
    },
  });

  return NextResponse.json({
    rewardType,
    value,
    message,
    sliceIndex,
    sliceCount: prizes.length,
  });
}

export async function PATCH(req: Request) {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }
  const body = (await req.json()) as { rewardId?: number };
  const rewardId = Number(body.rewardId);
  if (!Number.isInteger(rewardId) || rewardId <= 0) {
    return NextResponse.json({ message: 'Некорректная награда' }, { status: 400 });
  }

  const reward = await prisma.wheelReward.findFirst({
    where: { id: rewardId, userId: Number(session.user.id), rewardType: 'free_pizza', claimed: false },
  });
  if (!reward) {
    return NextResponse.json({ message: 'Награда недоступна' }, { status: 404 });
  }

  const token = cookies().get('cartToken')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Корзина не найдена' }, { status: 400 });
  }
  const cart = await findOrCreateCart(token);
  const productItem = await prisma.productItem.findFirst({
    where: { product: { category: { name: { contains: 'пицц', mode: 'insensitive' } } } },
    orderBy: { price: 'asc' },
  });
  if (!productItem) {
    return NextResponse.json({ message: 'В каталоге нет пиццы' }, { status: 400 });
  }

  await prisma.cartItem.create({
    data: { cartId: cart.id, productItemId: productItem.id, quantity: 1, builderPayload: { freeReward: true, rewardId } },
  });
  await prisma.wheelReward.update({ where: { id: rewardId }, data: { claimed: true } });
  await updateCartTotalAmount(token);
  return NextResponse.json({ message: 'Бесплатная пицца добавлена в корзину' });
}
