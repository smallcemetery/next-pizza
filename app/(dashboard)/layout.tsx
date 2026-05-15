import { getUserSession } from '@/shared/lib/get-user-session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

export const metadata = {
  title: 'Next Pizza | Админка',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession();

  if (!session || session.role !== UserRole.ADMIN) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-transparent text-neutral-900">
      <header className="glass-card border-0">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/dashboard" className="font-black text-lg">
            Админ-панель
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link className="underline-offset-4 hover:underline" href="/dashboard">
              Обзор
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/orders">
              Заказы
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/promos">
              Промокоды
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/menu">
              Меню
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/stories">
              Истории
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/happy-hour">
              Счастливые часы
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/stop-list">
              Стоп-лист
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/bonuses">
              Бонусы
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/wheel">
              Колесо фортуны
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/">
              На сайт
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
