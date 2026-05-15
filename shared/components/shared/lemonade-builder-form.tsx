'use client';

import { resolveImageUrl } from '@/shared/lib/media';
import React from 'react';
import { Button } from '../ui';
import { Title } from './title';
import { WhiteBlock } from './white-block';

const BASE = ['Газировка', 'Сок'] as const;
const SYRUP = ['Клубника', 'Мята', 'Имбирь'] as const;
const TOP = ['Лёд', 'Лайм', 'Базилик'] as const;

export type LemonadeCartPayload = {
  productItemId: number;
  ingredients: number[];
  builderPayload: Record<string, unknown>;
};

interface Props {
  imageUrl: string;
  name: string;
  basePrice: number;
  productItemId: number;
  loading?: boolean;
  onSubmit: (payload: LemonadeCartPayload) => void;
}

export const LemonadeBuilderForm: React.FC<Props> = ({
  imageUrl,
  name,
  basePrice,
  productItemId,
  loading,
  onSubmit,
}) => {
  const [base, setBase] = React.useState<(typeof BASE)[number]>('Газировка');
  const [syrup, setSyrup] = React.useState<(typeof SYRUP)[number]>('Клубника');
  const [tops, setTops] = React.useState<string[]>([]);

  const toggleTop = (t: string) => {
    setTops((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const extra = tops.length * 25;
  const price = basePrice + extra;

  return (
    <WhiteBlock>
      <div className="flex flex-col gap-8 lg:flex-row">
        <img
          className="mx-auto w-64 rounded-lg object-contain"
          src={resolveImageUrl(imageUrl)}
          alt={name}
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1 space-y-6">
          <Title text={name} size="lg" className="font-extrabold" />
          <div>
            <p className="mb-2 text-sm font-bold">Основа</p>
            <div className="flex flex-wrap gap-2">
              {BASE.map((b) => (
                <Button
                  key={b}
                  type="button"
                  variant={base === b ? 'default' : 'secondary'}
                  onClick={() => setBase(b)}>
                  {b}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Сироп</p>
            <div className="flex flex-wrap gap-2">
              {SYRUP.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={syrup === s ? 'default' : 'secondary'}
                  onClick={() => setSyrup(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Топпинги (+25 ₽)</p>
            <div className="flex flex-wrap gap-2">
              {TOP.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={tops.includes(t) ? 'default' : 'secondary'}
                  onClick={() => toggleTop(t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-black">{price} ₽</span>
            <Button
              loading={loading}
              type="button"
              className="h-14 rounded-2xl px-8 text-base font-bold"
              onClick={() =>
                onSubmit({
                  productItemId,
                  ingredients: [],
                  builderPayload: { base, syrup, toppings: tops, label: `${base}, ${syrup}` },
                })
              }>
              В корзину
            </Button>
          </div>
        </div>
      </div>
    </WhiteBlock>
  );
};
