import { prisma } from '@/prisma/prisma-client';
import { getAdminSession } from '@/shared/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const cfg =
    (await prisma.happyHourConfig.findUnique({ where: { id: 1 } })) ??
    (await prisma.happyHourConfig.create({
      data: { id: 1 },
    }));

  return NextResponse.json(cfg);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const body = (await req.json()) as {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    bonusPercent?: number;
  };

  const cfg = await prisma.happyHourConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      enabled: body.enabled ?? false,
      startTime: body.startTime ?? '15:00',
      endTime: body.endTime ?? '17:00',
      bonusPercent: body.bonusPercent ?? 20,
    },
    update: {
      ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      ...(body.startTime ? { startTime: body.startTime } : {}),
      ...(body.endTime ? { endTime: body.endTime } : {}),
      ...(typeof body.bonusPercent === 'number' ? { bonusPercent: body.bonusPercent } : {}),
    },
  });

  return NextResponse.json(cfg);
}
