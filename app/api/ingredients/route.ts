import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany();
    return NextResponse.json(ingredients);
  } catch (e) {
    console.error('[ingredients]', e);
    return NextResponse.json([]);
  }
}
