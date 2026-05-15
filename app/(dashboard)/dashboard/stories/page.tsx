'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '@/shared/lib/media';

type StoryItem = { id: number; sourceUrl: string };
type Story = { id: number; previewImageUrl: string; items: StoryItem[] };

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Не удалось загрузить файл');
  return data.url as string;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = React.useState<Story[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = React.useState('');
  const [newItemByStory, setNewItemByStory] = React.useState<Record<number, string>>({});
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    const data = await fetch('/api/admin/stories').then((r) => r.json());
    setStories(Array.isArray(data) ? data : []);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const createStory = async () => {
    if (!previewImageUrl.trim()) {
      toast.error('Добавьте превью истории');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/admin/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previewImageUrl: previewImageUrl.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.message || 'Ошибка');
      return;
    }
    setPreviewImageUrl('');
    toast.success('История добавлена');
    load();
  };

  const updatePreview = async (id: number, value: string) => {
    const res = await fetch('/api/admin/stories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, previewImageUrl: value.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Ошибка');
      return;
    }
    toast.success('Превью обновлено');
    load();
  };

  const deleteStory = async (id: number) => {
    const res = await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Ошибка');
      return;
    }
    toast.success('История удалена');
    load();
  };

  const addItem = async (storyId: number) => {
    const sourceUrl = (newItemByStory[storyId] ?? '').trim();
    if (!sourceUrl) {
      toast.error('Добавьте фото для слайда');
      return;
    }
    const res = await fetch(`/api/admin/stories/${storyId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Ошибка');
      return;
    }
    setNewItemByStory((s) => ({ ...s, [storyId]: '' }));
    toast.success('Слайд добавлен');
    load();
  };

  const deleteItem = async (storyId: number, itemId: number) => {
    const res = await fetch(`/api/admin/stories/${storyId}/items?itemId=${itemId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Ошибка');
      return;
    }
    toast.success('Слайд удалён');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Истории</h1>
      <p className="text-sm text-neutral-600">Здесь можно добавлять фото для каждой истории и удалять слайды.</p>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">Новая история</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            className="rounded border px-3 py-2"
            placeholder="Ссылка на превью или загрузите файл"
            value={previewImageUrl}
            onChange={(e) => setPreviewImageUrl(e.target.value)}
          />
          <button
            type="button"
            className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white disabled:opacity-60"
            disabled={loading}
            onClick={createStory}>
            Добавить историю
          </button>
        </div>
        <label className="mt-3 block text-sm">
          Фото превью с компьютера
          <input
            type="file"
            accept="image/*"
            className="mt-1 block"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await uploadFile(file);
                setPreviewImageUrl(url);
                toast.success('Фото загружено');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Ошибка');
              }
            }}
          />
        </label>
      </div>

      <div className="space-y-4">
        {stories.length === 0 && <p className="text-sm text-neutral-500">Историй пока нет.</p>}

        {stories.map((story) => (
          <div key={story.id} className="rounded-2xl border bg-white p-4">
            <div className="flex flex-wrap gap-4">
              <img src={resolveImageUrl(story.previewImageUrl)} alt="" className="h-28 w-24 rounded object-cover" />
              <div className="min-w-[260px] flex-1">
                <p className="text-sm font-semibold">История #{story.id}</p>
                <input
                  className="mt-2 w-full rounded border px-3 py-2"
                  value={story.previewImageUrl}
                  onChange={(e) =>
                    setStories((prev) =>
                      prev.map((s) => (s.id === story.id ? { ...s, previewImageUrl: e.target.value } : s)),
                    )
                  }
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border px-3 py-1.5 text-sm"
                    onClick={() => updatePreview(story.id, story.previewImageUrl)}>
                    Сохранить превью
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-600"
                    onClick={() => deleteStory(story.id)}>
                    Удалить историю
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border p-3">
              <p className="text-sm font-semibold">Слайды ({story.items.length})</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {story.items.map((item) => (
                  <div key={item.id} className="relative">
                    <img src={resolveImageUrl(item.sourceUrl)} alt="" className="h-28 w-20 rounded object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white"
                      onClick={() => deleteItem(story.id, item.id)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  className="rounded border px-3 py-2"
                  placeholder="Ссылка на фото слайда"
                  value={newItemByStory[story.id] ?? ''}
                  onChange={(e) => setNewItemByStory((s) => ({ ...s, [story.id]: e.target.value }))}
                />
                <button type="button" className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white" onClick={() => addItem(story.id)}>
                  Добавить слайд
                </button>
              </div>
              <label className="mt-2 block text-xs text-neutral-600">
                Фото слайда с компьютера
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadFile(file);
                      setNewItemByStory((s) => ({ ...s, [story.id]: url }));
                      toast.success('Фото загружено');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Ошибка');
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
