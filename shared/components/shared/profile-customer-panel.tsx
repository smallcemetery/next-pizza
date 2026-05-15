'use client';

import { AchievementType, DeliveryType, FulfillmentStatus, OrderStatus } from '@prisma/client';
import React from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui';
import { Title } from './title';
import { fulfillmentLabel } from '@/shared/constants/fulfillment-labels';

const ACH_TITLES: Partial<Record<AchievementType, string>> = {
  FIRST_ORDER: 'Первооткрыватель',
  GOURMET_ALL_CATEGORIES: 'Гурман',
  NIGHT_OWL: 'Сова',
  EARLY_BIRD: 'Жаворонок',
  FACTORY_FRIEND: 'Друг завода',
};

const WHEEL_COLORS = [
  '#c084fc',
  '#f472b6',
  '#38bdf8',
  '#a3e635',
  '#fb923c',
  '#fbbf24',
  '#94a3b8',
  '#e879f9',
  '#22c55e',
  '#818cf8',
];

function conicGradient(sliceCount: number): string {
  const n = Math.max(2, sliceCount);
  const seg = 360 / n;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = seg * i;
    const b = seg * (i + 1);
    parts.push(`${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${a}deg ${b}deg`);
  }
  return `conic-gradient(from -90deg, ${parts.join(', ')})`;
}

type WheelItem = { id: number; title: string };

export const ProfileCustomerPanel: React.FC = () => {
  const wheelTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wheelSpinning, setWheelSpinning] = React.useState(false);
  const [wheelRotation, setWheelRotation] = React.useState(0);
  const [wheelSliceCount, setWheelSliceCount] = React.useState(6);
  const [wheelSliceIndex, setWheelSliceIndex] = React.useState<number | null>(null);
  const [wheelItems, setWheelItems] = React.useState<WheelItem[]>([]);
  const [orders, setOrders] = React.useState<
    {
      id: number;
      totalAmount: number;
      status: OrderStatus;
      fulfillmentStatus: string;
      deliveryType: DeliveryType;
      createdAt: string;
      scheduledFor: string | null;
    }[]
  >([]);
  const [ach, setAch] = React.useState<{ type: AchievementType }[]>([]);
  const [wheelMsg, setWheelMsg] = React.useState<string | null>(null);
  const [wheelOpen, setWheelOpen] = React.useState(false);
  const [rewards, setRewards] = React.useState<{ id: number; rewardType: string; value: string; claimed: boolean }[]>(
    [],
  );

  const load = () => {
    fetch('/api/orders/my', { credentials: 'same-origin' })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error('orders');
        return j;
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));

    fetch('/api/me/achievements')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error('ach');
        return j;
      })
      .then((data) => setAch(Array.isArray(data) ? data : []))
      .catch(() => setAch([]));

    fetch('/api/wheel/rewards')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error('rewards');
        return j;
      })
      .then((data) => setRewards(Array.isArray(data) ? data : []))
      .catch(() => setRewards([]));

    fetch('/api/wheel/options')
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error('wheel-options');
        return j;
      })
      .then((data) => {
        const list = Array.isArray(data) ? (data as WheelItem[]) : [];
        setWheelItems(list);
        setWheelSliceCount(Math.max(2, list.length || 6));
      })
      .catch(() => {
        setWheelItems([]);
      });
  };

  React.useEffect(() => {
    load();
    const id = setInterval(() => {
      fetch('/api/orders/auto-progress', { method: 'POST' }).then(() => load());
    }, 120000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    return () => {
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, []);

  const spin = () => {
    if (wheelSpinning) {
      return;
    }
    setWheelOpen(true);
    setWheelSpinning(true);
    setWheelMsg(null);

    fetch('/api/wheel/spin', { method: 'POST' })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || 'Ошибка');
        return j as {
          message: string;
          sliceIndex: number;
          sliceCount: number;
        };
      })
      .then((j) => {
        const sliceCount = Math.max(2, Number(j.sliceCount) || 8);
        const sliceIndex = Math.min(sliceCount - 1, Math.max(0, Number(j.sliceIndex) || 0));
        setWheelSliceCount(sliceCount);
        setWheelSliceIndex(sliceIndex);

        const rounds = 5 + Math.floor(Math.random() * 3);
        const segment = 360 / sliceCount;
        const pointerOffset = segment / 2;
        const spinDegrees = rounds * 360 + (360 - sliceIndex * segment - pointerOffset);

        setWheelRotation((prev) => prev + spinDegrees);

        if (wheelTimerRef.current) {
          clearTimeout(wheelTimerRef.current);
        }
        wheelTimerRef.current = setTimeout(() => {
          setWheelSpinning(false);
          setWheelMsg(j.message);
          toast.success(j.message);
          load();
        }, 3200);
      })
      .catch((e) => {
        setWheelSpinning(false);
        toast.error(e instanceof Error ? e.message : 'Ошибка');
      });
  };

  const activateFreePizza = async (rewardId: number) => {
    const res = await fetch('/api/wheel/spin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message ?? 'Не удалось активировать');
      return;
    }
    toast.success(data.message);
    load();
  };

  return (
    <div className="space-y-6">
      <Title text="Бонусы и активности" size="md" className="font-bold tracking-tight" />

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Колесо фортуны</h3>
        <p className="text-sm text-neutral-600 mb-3">Раз в сутки после входа — промокод или бонусы. Каждый сектор подписан.</p>
        <div className="flex gap-2">
          <Button type="button" onClick={spin} loading={wheelSpinning}>
            Крутить колесо
          </Button>
        </div>
        {wheelMsg && <p className="mt-2 text-sm text-green-700">{wheelMsg}</p>}
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Достижения</h3>
        <ul className="text-sm space-y-1">
          {ach.length === 0 && <li className="text-neutral-500">Пока пусто — делайте заказы!</li>}
          {ach.map((a) => (
            <li key={a.type}>🏅 {ACH_TITLES[a.type] ?? a.type}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Мои заказы</h3>
        <ul className="text-sm space-y-2 max-h-80 overflow-y-auto">
          {orders.length === 0 && <li className="text-neutral-500">Заказов пока нет</li>}
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-neutral-100 p-3">
              <div className="font-mono font-bold">#{o.id}</div>
              <div>
                {fulfillmentLabel(o.fulfillmentStatus as FulfillmentStatus, o.deliveryType)} ·{' '}
                {o.totalAmount} ₽
              </div>
              {o.scheduledFor && (
                <div className="text-xs text-orange-600">
                  Предзаказ: {new Date(o.scheduledFor).toLocaleString('ru-RU')}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Награды колеса</h3>
        <ul className="space-y-2 text-sm">
          {rewards.length === 0 && <li className="text-neutral-500">Пока наград нет</li>}
          {rewards.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded border p-2">
              <span>
                {r.rewardType === 'free_pizza' ? 'Бесплатная пицца' : `${r.rewardType}: ${r.value}`}
              </span>
              {r.rewardType === 'free_pizza' && !r.claimed ? (
                <Button type="button" size="sm" onClick={() => activateFreePizza(r.id)}>
                  Активировать
                </Button>
              ) : (
                <span className="text-xs text-neutral-500">{r.claimed ? 'Активировано' : 'Получено'}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {wheelOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-5">
            <h3 className="font-black text-lg">Колесо фортуны</h3>
            <p className="mt-2 text-sm text-neutral-600">Стрелка сверху указывает на выигрышный сектор.</p>
            <div className="relative mx-auto mt-6 flex h-72 w-72 items-center justify-center">
              <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-orange-500 drop-shadow-md" />
              </div>
              <div
                className="relative h-64 w-64 rounded-full border-[10px] border-white shadow-xl"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: conicGradient(wheelSliceCount),
                  transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {Array.from({ length: wheelSliceCount }).map((_, i) => {
                  const angle = (360 / wheelSliceCount) * i + 360 / wheelSliceCount / 2 - 90;
                  const title = wheelItems[i]?.title ?? `Сектор ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className="pointer-events-none absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-108px) rotate(${-angle}deg)`,
                      }}>
                      {title}
                    </div>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute h-16 w-16 rounded-full border-4 border-white bg-neutral-900/80 shadow-md" />
            </div>
            {wheelSliceIndex != null && (
              <p className="mt-3 rounded-xl bg-white/80 p-2 text-sm font-semibold text-neutral-700">
                Выпал сектор #{wheelSliceIndex + 1}: {wheelItems[wheelSliceIndex]?.title ?? 'Награда'}
              </p>
            )}
            <div className="mt-3 max-h-28 space-y-1 overflow-y-auto rounded-xl border bg-white/70 p-2 text-xs">
              {Array.from({ length: wheelSliceCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
                  />
                  <span>
                    {i + 1}. {wheelItems[i]?.title ?? `Сектор ${i + 1}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setWheelOpen(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
