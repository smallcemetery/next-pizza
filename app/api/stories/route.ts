import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      include: {
        items: true,
      },
    });

    return NextResponse.json(stories);
  } catch (e) {
    console.error('[stories]', e);
    return NextResponse.json([]);
  }
}
