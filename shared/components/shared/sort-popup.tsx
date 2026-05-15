'use client';

import { cn } from '@/shared/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface Props {
  className?: string;
}

const OPTIONS = [
  { value: 'popular', label: 'Популярное' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
] as const;

export const SortPopup: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sortBy') || 'popular';
  const label = OPTIONS.find((o) => o.value === current)?.label ?? 'Популярное';

  const onChange = (value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (!value || value === 'popular') {
      p.delete('sortBy');
    } else {
      p.set('sortBy', value);
    }
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    router.refresh();
  };

  return (
    <label
      className={cn(
        'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white/70 px-3 text-sm shadow-sm',
        className,
      )}>
      <ArrowUpDown size={16} />
      <span className="hidden sm:inline font-semibold">Сортировка:</span>
      <select
        className="max-w-[150px] cursor-pointer bg-transparent font-bold text-primary outline-none sm:max-w-[200px]"
        value={current}
        onChange={(e) => onChange(e.target.value)}>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="sr-only">Текущая: {label}</span>
    </label>
  );
};
