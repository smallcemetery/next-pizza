'use client';

import React from 'react';

export default function AdminHappyHourPage() {
  const [cfg, setCfg] = React.useState({
    enabled: false,
    startTime: '15:00',
    endTime: '17:00',
    bonusPercent: 20,
  });

  const load = () =>
    fetch('/api/admin/happy-hour')
      .then((r) => r.json())
      .then(setCfg);

  React.useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await fetch('/api/admin/happy-hour', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    load();
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-black">Счастливые часы</h1>
      <p className="text-sm text-neutral-600">
        В это время вместо стандартных 10% бонусов начисляется выбранный процент (например 20%).
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cfg.enabled}
          onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
        />
        Акция включена
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col text-xs">
          С
          <input
            className="rounded border px-2 py-1"
            value={cfg.startTime}
            onChange={(e) => setCfg({ ...cfg, startTime: e.target.value })}
          />
        </label>
        <label className="flex flex-1 flex-col text-xs">
          До
          <input
            className="rounded border px-2 py-1"
            value={cfg.endTime}
            onChange={(e) => setCfg({ ...cfg, endTime: e.target.value })}
          />
        </label>
      </div>
      <label className="flex flex-col text-xs">
        Процент бонусов
        <input
          type="number"
          className="rounded border px-2 py-1"
          value={cfg.bonusPercent}
          onChange={(e) => setCfg({ ...cfg, bonusPercent: Number(e.target.value) })}
        />
      </label>
      <button type="button" className="rounded-xl bg-orange-500 px-6 py-2 font-bold text-white" onClick={save}>
        Сохранить
      </button>
    </div>
  );
}
