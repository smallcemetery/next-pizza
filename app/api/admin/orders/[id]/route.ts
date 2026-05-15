import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { FulfillmentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const id = Number(params.id);
  const body = (await req.json()) as {
    fulfillmentStatus?: FulfillmentStatus;
    autoProgressEnabled?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (body.fulfillmentStatus) {
    data.fulfillmentStatus = body.fulfillmentStatus;
    data.autoProgressEnabled = body.autoProgressEnabled ?? false;
  }
  if (typeof body.autoProgressEnabled === 'boolean' && !body.fulfillmentStatus) {
    data.autoProgressEnabled = body.autoProgressEnabled;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: 'Нет данных' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data,
  });

  return NextResponse.json(order);
}
