/**
 * Подставляет DATABASE_URL до создания PrismaClient (Next.js).
 * По умолчанию — SQLite prisma/dev.db (путь относительно каталога prisma/).
 * Для PostgreSQL задайте DATABASE_URL в .env (postgresql://...).
 */
const SQLITE_DEFAULT = 'file:./dev.db';

export function ensureDatabaseUrl(): void {
  if (typeof process === 'undefined') return;

  if (process.env.DATABASE_URL?.trim()) {
    return;
  }

  const legacy =
    process.env.POSTGRES_PRISMA_URL?.trim() || process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (legacy && /^(postgres|postgresql):/i.test(legacy)) {
    process.env.DATABASE_URL = legacy;
    return;
  }

  process.env.DATABASE_URL = SQLITE_DEFAULT;
}

ensureDatabaseUrl();
