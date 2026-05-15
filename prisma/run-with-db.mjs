/**
 * Запуск Prisma CLI с DATABASE_URL по умолчанию (SQLite, файл prisma/dev.db).
 * Не требует Docker и не требует ручной правки .env для локального старта.
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  console.error('Usage: node prisma/run-with-db.mjs <prisma args...>');
  process.exit(1);
}

const r = spawnSync('npx', ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
  shell: true,
});

process.exit(r.status ?? 1);
