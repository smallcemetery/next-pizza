'use client';

import React from 'react';

export default function AdminPromosPage() {
  const [list, setList] = React.useState<{ id: number; code: string; percentOff: number; usedCount: number; active: boolean }[]>([]);
  const [code, setCode] = React.useState('');
  const [pct, setPct] = React.useState(10);

  const load = () => fetch('/api/admin/promos').then((r) => r.json()).then(setList);

  React.useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, percentOff: pct }),
    });
    setCode('');
    load();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-black">Промокоды</h1>
      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-4">
        <input
          className="flex-1 min-w-[140px] rounded border px-3 py-2"
          placeholder="Код"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <select
          className="rounded border px-2"
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}>
          <option value={5}>5%</option>
          <option value={10}>10%</option>
          <option value={15}>15%</option>
        </select>
        <button
          type="button"
          className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white"
          onClick={create}>
          Создать
        </button>
      </div>
      <ul className="space-y-2 text-sm">
        {list.map((p) => (
          <li key={p.id} className="flex justify-between rounded border bg-white px-3 py-2">
            <span className="font-mono font-bold">{p.code}</span>
            <span>
              {p.percentOff}% · использований {p.usedCount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
