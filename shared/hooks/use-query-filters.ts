import React from 'react';
import { Filters } from './use-filters';
import qs from 'qs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useQueryFilters = (filters: Filters) => {
  const isMounted = React.useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortByRef = React.useRef<string | null>(null);
  sortByRef.current = searchParams.get('sortBy');

  React.useEffect(() => {
    if (isMounted.current) {
      const params = {
        ...filters.prices,
        pizzaTypes: Array.from(filters.pizzaTypes),
        sizes: Array.from(filters.sizes),
        ingredients: Array.from(filters.selectedIngredients),
      };

      const query = qs.stringify(params, {
        arrayFormat: 'comma',
      });

      const next = new URLSearchParams(query);
      const sortBy = sortByRef.current;
      if (sortBy) {
        next.set('sortBy', sortBy);
      }

      const qsStr = next.toString();
      router.push(qsStr ? `${pathname}?${qsStr}` : pathname, {
        scroll: false,
      });
      router.refresh();
    }

    isMounted.current = true;
  }, [filters, pathname, router]);
};
