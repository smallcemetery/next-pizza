import { NextRequest, NextResponse } from 'next/server';
import { resolvePromoPercent } from '@/shared/lib/resolve-promo';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const { percent, promoId } = await resolvePromoPercent(q, 0);
  return NextResponse.json({ percent, promoId });
}
