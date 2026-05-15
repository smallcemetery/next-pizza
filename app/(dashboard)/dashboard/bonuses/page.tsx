'use client';

import React from 'react';

type UserRow = { id: number; fullName: string; email: string; bonusBalance: number };

export default function AdminBonusesPage() {
  const [q, setQ] = React.useState('');
  const [hits, setHits] = React.useState<UserRow[]>([]);
  const [selected, setSelected] = React.useState<UserRow | null>(null);
  const [amount, setAmount] = React.useState(100);

  const search = () => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    fetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setHits);
  };

  const grant = async () => {
    if (!selected) return;
    await fetch(`/api/admin/users/${selected.id}/bonuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    search();
    setSelected(null);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-black">Начисление бонусов</h1>
      <p className="text-sm text-neutral-600">
        Поиск по имени, почте или номеру заказа (ID заказа привяжется к клиенту).
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Имя, email или № заказа"
        />
        <button type="button" className="rounded-xl bg-neutral-800 px-4 py-2 text-white" onClick={search}>
          Найти
        </button>
      </div>
      <ul className="space-y-1 text-sm">
        {hits.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              className={`w-full rounded border px-3 py-2 text-left ${selected?.id === u.id ? 'border-orange-500 bg-orange-50' : 'bg-white'}`}
              onClick={() => setSelected(u)}>
              <div className="font-bold">{u.fullName}</div>
              <div className="text-neutral-500">{u.email}</div>
              <div>Баланс: {u.bonusBalance} б.</div>
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="flex flex-wrap items-end gap-2 rounded-2xl border bg-white p-4">
          <label className="text-xs">
            Сумма бонусов
            <input
              type="number"
              className="mt-1 block rounded border px-2 py-1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <button type="button" className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white" onClick={grant}>
            Начислить
          </button>
        </div>
      )}
    </div>
  );
}
