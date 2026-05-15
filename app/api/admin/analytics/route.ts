import { getAdminSession } from '@/shared/lib/admin-auth';
import { getAdminAnalytics } from '@/shared/lib/admin-analytics';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const data = await getAdminAnalytics();
  return NextResponse.json(data);
}
