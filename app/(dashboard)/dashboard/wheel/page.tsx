'use client';

import React from 'react';

type Prize = {
  id: number;
  title: string;
  rewardType: string;
  value: string;
  chanceBasis: number;
  active: boolean;
};

export default function AdminWheelPage() {
  const [list, setList] = React.useState<Prize[]>([]);
  const [total, setTotal] = React.useState(0);
  const [form, setForm] = React.useState({ title: '', rewardType: 'bonus', value: '', chanceBasis: 100 });

  const load = async () => {
    const data = await fetch('/api/admin/wheel').then((r) => r.json());
    setList(data.list ?? []);
    setTotal(data.totalChance ?? 0);
  };

  React.useEffect(() => {
    load();
  }, []);

  const createPrize = async () => {
    await fetch('/api/admin/wheel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', rewardType: 'bonus', value: '', chanceBasis: 100 });
    load();
  };

  const updatePrize = async (id: number, payload: Partial<Prize>) => {
    await fetch('/api/admin/wheel', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Колесо фортуны</h1>
      <p className="text-sm text-neutral-600">Суммарный вес шансов: {total}. Чем больше вес, тем чаще выпадение.</p>

      <div className="glass-card rounded-2xl p-4">
        <h2 className="mb-3 font-bold">Добавить акцию</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded border px-3 py-2"
            placeholder="Название"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          />
          <select
            className="rounded border px-3 py-2"
            value={form.rewardType}
            onChange={(e) => setForm((s) => ({ ...s, rewardType: e.target.value }))}>
            <option value="bonus">Бонусы</option>
            <option value="promo">Промо %</option>
            <option value="free_pizza">Бесплатная пицца</option>
          </select>
          <input
            className="rounded border px-3 py-2"
            placeholder="Значение (например 100 или 10)"
            value={form.value}
            onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
          />
          <input
            className="rounded border px-3 py-2"
            type="number"
            placeholder="Вес шанса"
            value={form.chanceBasis}
            onChange={(e) => setForm((s) => ({ ...s, chanceBasis: Number(e.target.value) }))}
          />
        </div>
        <button type="button" className="mt-3 rounded-xl bg-violet-600 px-4 py-2 font-bold text-white" onClick={createPrize}>
          Добавить
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-3 text-left">Акция</th>
              <th className="p-3 text-left">Тип</th>
              <th className="p-3 text-left">Значение</th>
              <th className="p-3 text-left">Шанс</th>
              <th className="p-3 text-left">Активность</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.title}</td>
                <td className="p-3">{item.rewardType}</td>
                <td className="p-3">{item.value}</td>
                <td className="p-3">
                  <input
                    type="number"
                    className="w-24 rounded border px-2 py-1"
                    value={item.chanceBasis}
                    onChange={(e) => updatePrize(item.id, { chanceBasis: Number(e.target.value) })}
                  />
                </td>
                <td className="p-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => updatePrize(item.id, { active: e.target.checked })}
                    />
                    {item.active ? 'Вкл' : 'Выкл'}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
