import { prisma } from '@/prisma/prisma-client';
import { authOptions } from '@/shared/constants/auth-options';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Вы не авторизованы' }, { status: 401 });
    }

    const data = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        bonusBalance: true,
        referralCode: true,
        role: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: '[USER_GET] Server error' }, { status: 500 });
  }
}
