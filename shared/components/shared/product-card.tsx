import { resolveImageUrl } from '@/shared/lib/media';
import Link from 'next/link';
import React from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { Plus } from 'lucide-react';
import { Ingredient } from '@prisma/client';
import { cn } from '@/shared/lib/utils';

interface Props {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  ingredients: Ingredient[];
  lowStock?: boolean;
  className?: string;
}

export const ProductCard: React.FC<Props> = ({
  id,
  name,
  price,
  imageUrl,
  ingredients,
  lowStock,
  className,
}) => {
  return (
    <div className={cn('group rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl', className)}>
      <Link href={`/product/${id}`}>
        <div className="relative flex h-[250px] justify-center rounded-2xl bg-gradient-to-b from-violet-50 to-white p-6">
          {lowStock && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">
              Мало ингредиентов
            </span>
          )}
          <img
            className="h-[215px] w-[215px] object-contain transition-transform duration-300 group-hover:scale-105"
            src={resolveImageUrl(imageUrl)}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        </div>

        <Title text={name} size="sm" className="mb-1 mt-4 font-bold" />

        <p className="line-clamp-2 min-h-10 text-sm text-gray-500">
          {ingredients.map((ingredient) => ingredient.name).join(', ')}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[20px]">
            от <b>{price} ₽</b>
          </span>

          <Button variant="secondary" className="rounded-xl text-base font-bold">
            <Plus size={20} className="mr-1" />
            Добавить
          </Button>
        </div>
      </Link>
    </div>
  );
};
