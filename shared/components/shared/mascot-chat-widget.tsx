'use client';

import React from 'react';
import toast from 'react-hot-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

export const MascotChatWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [chatId, setChatId] = React.useState<number | null>(null);
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: 'assistant', content: 'Привет! Я маскот Next Pizza. Напиши, что подсказать по заказу.' },
  ]);

  const send = async () => {
    const text = value.trim();
    if (!text || loading) return;
    setValue('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    const res = await fetch('/api/mascot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, chatId }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message ?? 'Ошибка маскота');
      setLoading(false);
      return;
    }
    setChatId(data.chatId);
    setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-xl hover:scale-[1.02] transition-transform">
        <span>Поддержка</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/40 p-4">
          <div className="glass-card h-[520px] w-full max-w-md rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black">Чат с маскотом</h3>
              <button type="button" className="rounded px-2 py-1 text-sm" onClick={() => setOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="h-[390px] space-y-2 overflow-y-auto rounded-xl bg-white/70 p-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'ml-auto bg-violet-600 text-white' : 'bg-white'
                  }`}>
                  {m.content}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Напишите сообщение..."
              />
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
