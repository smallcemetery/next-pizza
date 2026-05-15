import { getAdminAnalytics } from '@/shared/lib/admin-analytics';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const data = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">Обзор</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Популярное блюдо за неделю</p>
          <p className="mt-2 text-xl font-bold">
            {data.popularWeek ? `${data.popularWeek.name} (${data.popularWeek.count})` : '—'}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Средний чек (7 дней)</p>
          <p className="mt-2 text-xl font-bold">{data.avgCheck} ₽</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Топ промокод</p>
          <p className="mt-2 text-xl font-bold">
            {data.topPromo ? `${data.topPromo.code} (${data.topPromo.uses})` : '—'}
          </p>
        </div>
      </div>
      <p className="text-sm text-neutral-600">
        Заказов за неделю: <b>{data.ordersWeek}</b>.
      </p>
    </div>
  );
}
