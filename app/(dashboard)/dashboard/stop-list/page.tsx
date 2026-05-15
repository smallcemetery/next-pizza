'use client';

import React from 'react';

type Ing = { id: number; name: string; isOutOfStock: boolean };

export default function AdminStopListPage() {
  const [list, setList] = React.useState<Ing[]>([]);

  const load = () => fetch('/api/admin/ingredients/stop').then((r) => r.json()).then(setList);

  React.useEffect(() => {
    load();
  }, []);

  const toggle = async (id: number, isOutOfStock: boolean) => {
    await fetch('/api/admin/ingredients/stop', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientId: id, isOutOfStock }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Стоп-лист ингредиентов</h1>
      <p className="text-sm text-neutral-600 max-w-xl">
        Отметьте, чего нет на кухне: блюда с этим ингредиентом на сайте станут недоступны для заказа и получат
        пометку о нехватке.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm">
            <span>{i.name}</span>
            <button
              type="button"
              className={i.isOutOfStock ? 'text-red-600 font-bold' : 'text-neutral-400'}
              onClick={() => toggle(i.id, !i.isOutOfStock)}>
              {i.isOutOfStock ? 'Закончилось' : 'В наличии'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
