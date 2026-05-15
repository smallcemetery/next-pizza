'use client';

import React from 'react';
import { Button } from '../ui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const HomeLuckyBar: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const lucky = async () => {
    try {
      setLoading(true);
      const r = await fetch('/api/cart/feeling-lucky', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || 'Ошибка');
      toast.success('В корзину добавлен обед! Введите промокод LUCKYLUNCH на оплате (-5%).');
      router.push('/checkout');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="secondary" loading={loading} onClick={lucky}>
        Не могу выбрать — собери обед
      </Button>
    </div>
  );
};
