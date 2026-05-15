'use client';

import React from 'react';
import toast from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  imageUrl: string;
  disabled: boolean;
  categoryId: number;
  category: { name: string };
  items: { id: number; price: number }[];
  ingredients: { id: number; name: string }[];
};

type Ingredient = { id: number; name: string; price: number; imageUrl: string };

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message || 'Загрузка не удалась');
  return j.url as string;
}

export default function AdminMenuPage() {
  const [list, setList] = React.useState<Product[]>([]);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState(299);
  const [imageUrl, setImageUrl] = React.useState(
    'https://media.dodostatic.net/image/r:292x292/11EE7D61304FAF5A98A6958F2BB2D260.webp',
  );
  const [categoryId, setCategoryId] = React.useState(1);
  const [addIngredientIds, setAddIngredientIds] = React.useState<number[]>([]);

  const [edit, setEdit] = React.useState<Product | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editPrice, setEditPrice] = React.useState(0);
  const [editImageUrl, setEditImageUrl] = React.useState('');
  const [editCategoryId, setEditCategoryId] = React.useState(1);
  const [editIngredientIds, setEditIngredientIds] = React.useState<number[]>([]);

  const load = () => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []));
    fetch('/api/ingredients')
      .then((r) => r.json())
      .then((data) => setIngredients(Array.isArray(data) ? data : []));
  };

  React.useEffect(() => {
    load();
  }, []);

  const toggleIngredient = (id: number, set: React.Dispatch<React.SetStateAction<number[]>>) => {
    set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggle = async (id: number, disabled: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled }),
    });
    load();
  };

  const add = async () => {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        price,
        imageUrl,
        categoryId,
        ingredientIds: addIngredientIds.length ? addIngredientIds : undefined,
      }),
    });
    setName('');
    setAddIngredientIds([]);
    load();
  };

  const openEdit = (p: Product) => {
    setEdit(p);
    setEditName(p.name);
    setEditPrice(p.items[0]?.price ?? 0);
    setEditImageUrl(p.imageUrl ?? '');
    setEditCategoryId(p.categoryId);
    setEditIngredientIds(p.ingredients?.map((i) => i.id) ?? []);
  };

  const saveEdit = async () => {
    if (!edit) return;
    await fetch(`/api/admin/products/${edit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        price: editPrice,
        imageUrl: editImageUrl,
        categoryId: editCategoryId,
        ingredientIds: editIngredientIds,
      }),
    });
    setEdit(null);
    load();
    toast.success('Сохранено');
  };

  const saveIngredient = async (ing: Ingredient) => {
    await fetch(`/api/admin/ingredients/${ing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ing.name,
        price: ing.price,
        imageUrl: ing.imageUrl,
      }),
    });
    load();
    toast.success('Ингредиент обновлён');
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-black">Меню</h1>

      <div className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-2">
        <input
          className="rounded border px-3 py-2"
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <input
          className="rounded border px-3 py-2 md:col-span-2"
          placeholder="URL картинки или загрузите файл ниже"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <label className="text-sm md:col-span-2">
          Фото с компьютера
          <input
            type="file"
            accept="image/*"
            className="mt-1 block"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const url = await uploadFile(f);
                setImageUrl(url);
                toast.success('Файл загружен');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Ошибка');
              }
            }}
          />
        </label>
        <select
          className="rounded border px-2"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}>
          <option value={1}>Пиццы</option>
          <option value={2}>Завтрак</option>
          <option value={3}>Закуски</option>
          <option value={4}>Коктейли</option>
          <option value={5}>Напитки</option>
        </select>
        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-semibold text-neutral-600">Ингредиенты (новое блюдо)</p>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded border p-2 text-xs">
            {ingredients.map((i) => (
              <label key={i.id} className="flex cursor-pointer items-center gap-1">
                <input
                  type="checkbox"
                  checked={addIngredientIds.includes(i.id)}
                  onChange={() => toggleIngredient(i.id, setAddIngredientIds)}
                />
                {i.name}
              </label>
            ))}
          </div>
        </div>
        <button type="button" className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white" onClick={add}>
          Добавить блюдо
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="p-3">Название</th>
              <th className="p-3">Категория</th>
              <th className="p-3">Цена</th>
              <th className="p-3">В меню</th>
              <th className="p-3"> </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{p.items[0]?.price ?? '—'} ₽</td>
                <td className="p-3">
                  <button
                    type="button"
                    className="text-orange-600 underline"
                    onClick={() => toggle(p.id, !p.disabled)}>
                    {p.disabled ? 'Вернуть' : 'Скрыть'}
                  </button>
                </td>
                <td className="p-3">
                  <button type="button" className="font-semibold text-violet-600 underline" onClick={() => openEdit(p)}>
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-black">Ингредиенты</h2>
        <p className="mt-1 text-sm text-neutral-600">Меняйте название, цену, ссылку или загрузите новое фото.</p>
        <div className="mt-4 space-y-4">
          {ingredients.map((ing) => (
            <IngredientRow key={ing.id} ing={ing} onSave={saveIngredient} />
          ))}
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black">Редактирование: {edit.name}</h3>
            <label className="mt-4 block text-sm">
              Название
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </label>
            <label className="mt-3 block text-sm">
              Цена
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
              />
            </label>
            <label className="mt-3 block text-sm">
              Картинка (URL)
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </label>
            <label className="mt-2 block text-sm">
              Загрузить фото
              <input
                type="file"
                accept="image/*"
                className="mt-1 block"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setEditImageUrl(url);
                    toast.success('Файл загружен');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Ошибка');
                  }
                }}
              />
            </label>
            <label className="mt-3 block text-sm">
              Категория
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(Number(e.target.value))}>
                <option value={1}>Пиццы</option>
                <option value={2}>Завтрак</option>
                <option value={3}>Закуски</option>
                <option value={4}>Коктейли</option>
                <option value={5}>Напитки</option>
              </select>
            </label>
            <div className="mt-3">
              <p className="text-sm font-semibold">Ингредиенты</p>
              <div className="mt-1 flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded border p-2 text-xs">
                {ingredients.map((i) => (
                  <label key={i.id} className="flex cursor-pointer items-center gap-1">
                    <input
                      type="checkbox"
                      checked={editIngredientIds.includes(i.id)}
                      onChange={() => toggleIngredient(i.id, setEditIngredientIds)}
                    />
                    {i.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="rounded-xl bg-orange-500 px-6 py-2 font-bold text-white"
                onClick={saveEdit}>
                Сохранить
              </button>
              <button type="button" className="rounded-xl border px-6 py-2" onClick={() => setEdit(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IngredientRow({
  ing,
  onSave,
}: {
  ing: Ingredient;
  onSave: (i: Ingredient) => void;
}) {
  const [name, setName] = React.useState(ing.name);
  const [price, setPrice] = React.useState(ing.price);
  const [imageUrl, setImageUrl] = React.useState(ing.imageUrl);

  React.useEffect(() => {
    setName(ing.name);
    setPrice(ing.price);
    setImageUrl(ing.imageUrl);
  }, [ing.id, ing.name, ing.price, ing.imageUrl]);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4 md:flex-row md:items-end">
      <label className="flex-1 text-xs">
        Название
        <input className="mt-1 w-full rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="w-28 text-xs">
        Цена
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </label>
      <label className="flex-1 text-xs">
        URL фото
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
      <label className="text-xs">
        Файл
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-40 text-xs"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const url = await uploadFile(f);
              setImageUrl(url);
              toast.success('Файл загружен');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Ошибка');
            }
          }}
        />
      </label>
      <button
        type="button"
        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
        onClick={() => onSave({ ...ing, name, price, imageUrl })}>
        Сохранить
      </button>
    </div>
  );
}
