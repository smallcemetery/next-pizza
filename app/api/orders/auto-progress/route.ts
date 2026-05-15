import { advanceOrdersAuto } from '@/shared/lib/order-payment-success';
import { getUserSessionOrThrow } from '@/shared/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getUserSessionOrThrow();
  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const n = await advanceOrdersAuto();
  return NextResponse.json({ advanced: n });
}
