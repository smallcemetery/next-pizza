import { cn } from '@/shared/lib/utils';
import React, { Suspense } from 'react';
import { Container } from './container';
import { Categories } from './categories';
import { SortPopup } from './sort-popup';
import { Category } from '@prisma/client';

interface Props {
  categories: Category[];
  className?: string;
}

export const TopBar: React.FC<Props> = ({ categories, className }) => {
  return (
    <div
      className={cn(
        'sticky top-[82px] z-10 border-y border-white/40 bg-white/85 py-4 backdrop-blur-md shadow-lg shadow-black/5',
        className,
      )}>
      <Container className="flex items-center justify-between ">
        <Categories items={categories} />
        <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-xl bg-white/50" />}>
          <SortPopup />
        </Suspense>
      </Container>
    </div>
  );
};
