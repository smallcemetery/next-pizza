'use client';

import { cn } from '@/shared/lib/utils';
import { useCategoryStore } from '@/shared/store/category';
import { Category } from '@prisma/client';
import React from 'react';

interface Props {
  items: Category[];
  className?: string;
}

export const Categories: React.FC<Props> = ({ items, className }) => {
  const categoryActiveId = useCategoryStore((state) => state.activeId);

  return (
    <div className={cn('inline-flex gap-1 rounded-2xl bg-white/70 p-1.5 shadow-sm', className)}>
      {items.map(({ name, id }) => (
        <a
          className={cn(
            'flex h-10 items-center rounded-xl px-4 text-sm font-bold transition-all',
            categoryActiveId === id
              ? 'bg-white text-primary shadow-sm'
              : 'text-neutral-700 hover:bg-white/70 hover:text-neutral-900',
          )}
          href={`/#${name}`}
          key={id}>
          {name}
        </a>
      ))}
    </div>
  );
};
