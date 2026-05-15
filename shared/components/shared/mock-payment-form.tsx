'use client';

import React from 'react';
import toast from 'react-hot-toast';

export const MockPaymentForm: React.FC<{ orderId: number; amount: number }> = ({ orderId, amount }) => {
  const [loading, setLoading] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [holder, setHolder] = React.useState('');
  const [expires, setExpires] = React.useState('');
  const [cvc, setCvc] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !amount) {
      toast.error('Неверные параметры оплаты');
      return;
    }

    if (
      cardNumber.replace(/\s/g, '').length < 16 ||
      holder.trim().length < 3 ||
      expires.length < 4 ||
      cvc.length < 3
    ) {
      toast.error('Проверьте данные карты');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/payment/mock/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      toast.error(data.message ?? 'Ошибка оплаты');
      return;
    }
    window.location.href = data.redirectUrl ?? '/?paid=1';
  };

  return (
    <main className="mx-auto mt-12 max-w-xl rounded-3xl border bg-white p-8 shadow-md">
      <h1 className="text-3xl font-black">Оплата заказа #{orderId}</h1>
      <p className="mt-2 text-neutral-600">Тестовая страница оплаты. Деньги не списываются.</p>
      <p className="mt-4 text-2xl font-extrabold">{Number.isFinite(amount) ? amount : 0} ₽</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Номер карты"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Имя держателя"
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full rounded-xl border px-4 py-3"
            placeholder="MM/YY"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-4 py-3"
            placeholder="CVC"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white disabled:opacity-50">
          {loading ? 'Оплачиваем...' : 'Оплатить'}
        </button>
      </form>
    </main>
  );
};
