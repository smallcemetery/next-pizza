'use client';

import { resolveImageUrl } from '@/shared/lib/media';
import { cn } from '@/shared/lib/utils';
import { Api } from '@/shared/services/api-client';
import { Product } from '@prisma/client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useClickAway, useDebounce } from 'react-use';

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const ref = React.useRef(null);

  useClickAway(ref, () => {
    setFocused(false);
  });

  useDebounce(
    async () => {
      try {
        const response = await Api.products.search(searchQuery);
        setProducts(response);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery],
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setProducts([]);
  };

  return (
    <>
      {focused && <div className="fixed bottom-0 left-0 right-0 top-0 z-20 bg-black/20 backdrop-blur-[1px]" />}

      <div
        ref={ref}
        className={cn('relative z-30 flex h-11 flex-1 justify-between rounded-2xl', className)}>
        <Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" />
        <input
          className="w-full rounded-2xl border border-white/70 bg-white/90 pl-11 pr-4 outline-none transition-all focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
          type="text"
          placeholder="Найти пиццу..."
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {products.length > 0 && (
          <div
            className={cn(
              'invisible absolute top-14 z-30 w-full rounded-2xl border border-white/70 bg-white/95 py-2 opacity-0 shadow-xl transition-all duration-200',
              focused && 'visible opacity-100 top-12',
            )}>
            {products.map((product) => (
              <Link
                onClick={onClickItem}
                key={product.id}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-primary/10"
                href={`/product/${product.id}`}>
                <img
                  className="rounded-sm h-8 w-8 object-cover"
                  src={resolveImageUrl(product.imageUrl)}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
                <span>{product.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
