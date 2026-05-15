'use client';

import { DeliveryType, FulfillmentStatus, Order } from '@prisma/client';
import React from 'react';
import { fulfillmentLabel } from '@/shared/constants/fulfillment-labels';

type Row = Order & {
  user: { id: number; fullName: string; email: string } | null;
  promoCode: { code: string } | null;
};

const deliveryStatuses = [
  FulfillmentStatus.PAID,
  FulfillmentStatus.IN_PROGRESS,
  FulfillmentStatus.WAITING_COURIER,
  FulfillmentStatus.DELIVERING,
  FulfillmentStatus.COMPLETED,
];

const pickupStatuses = [
  FulfillmentStatus.PAID,
  FulfillmentStatus.IN_PROGRESS,
  FulfillmentStatus.READY_FOR_PICKUP,
  FulfillmentStatus.COMPLETED,
];

export default function AdminOrdersPage() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = () => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    load();
  }, []);

  const patch = async (id: number, fulfillmentStatus: FulfillmentStatus) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillmentStatus, autoProgressEnabled: false }),
    });
    load();
  };

  if (loading) return <p className="rounded-xl bg-white/70 p-4">Загрузка…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Заказы</h1>
      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/90 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-violet-50/70">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Доставка</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Сменить</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-violet-50/30">
                <td className="p-3 font-mono">{o.id}</td>
                <td className="p-3">
                  {o.user ? (
                    <>
                      {o.user.fullName}
                      <div className="text-xs text-neutral-500">{o.user.email}</div>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">{o.totalAmount} ₽</td>
                <td className="p-3">{o.deliveryType === DeliveryType.DELIVERY ? 'Курьер' : 'Самовывоз'}</td>
                <td className="p-3">
                  {fulfillmentLabel(o.fulfillmentStatus, o.deliveryType)}
                  {o.promoCode && (
                    <div className="text-xs text-orange-600">Промо: {o.promoCode.code}</div>
                  )}
                </td>
                <td className="p-3">
                  <select
                    className="rounded border px-2 py-1 text-xs"
                    value={o.fulfillmentStatus}
                    onChange={(e) => patch(o.id, e.target.value as FulfillmentStatus)}>
                    {(o.deliveryType === DeliveryType.DELIVERY ? deliveryStatuses : pickupStatuses).map(
                      (s) => (
                        <option key={s} value={s}>
                          {fulfillmentLabel(s, o.deliveryType)}
                        </option>
                      ),
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
