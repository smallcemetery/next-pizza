import { getAdminSession } from '@/shared/lib/admin-auth';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof Blob) || file.size < 1) {
    return NextResponse.json({ message: 'Файл не получен' }, { status: 400 });
  }

  const max = 4 * 1024 * 1024;
  if (file.size > max) {
    return NextResponse.json({ message: 'Файл больше 4 МБ' }, { status: 400 });
  }

  const original =
    typeof (file as File).name === 'string' ? (file as File).name : 'image';
  const ext = (original.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);

  return NextResponse.json({ url: `/uploads/${name}` });
}
