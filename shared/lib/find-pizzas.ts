import { prisma } from '@/prisma/prisma-client';

export interface GetSearchParams {
  query?: string;
  sortBy?: string;
  sizes?: string;
  pizzaTypes?: string;
  ingredients?: string;
  priceFrom?: string;
  priceTo?: string;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

export const findPizzas = async (params: GetSearchParams) => {
  const sizes = params.sizes?.split(',').map(Number);
  const pizzaTypes = params.pizzaTypes?.split(',').map(Number);
  const ingredientsIdArr = params.ingredients?.split(',').map(Number);

  const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
  const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;

  try {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: {
          id: 'desc',
        },
        where: {
          disabled: false,
          ingredients: ingredientsIdArr
            ? {
                some: {
                  id: {
                    in: ingredientsIdArr,
                  },
                },
              }
            : undefined,
          items: {
            some: {
              size: {
                in: sizes,
              },
              pizzaType: {
                in: pizzaTypes,
              },
              price: {
                gte: minPrice, // >=
                lte: maxPrice, // <=
              },
            },
          },
        },
        include: {
          ingredients: true,
          items: {
            where: {
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
            },
            orderBy: {
              price: 'asc',
            },
          },
        },
      },
    },
  });

  const sortBy = params.sortBy?.trim() || 'popular';
  for (const cat of categories) {
    const lowestPrice = (p: (typeof cat.products)[number]) => {
      const prices = p.items.map((i) => i.price);
      return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
    };
    if (sortBy === 'price_asc') {
      cat.products.sort((a, b) => lowestPrice(a) - lowestPrice(b));
    } else if (sortBy === 'price_desc') {
      cat.products.sort((a, b) => lowestPrice(b) - lowestPrice(a));
    } else {
      cat.products.sort((a, b) => b.id - a.id);
    }
  }

  return categories;
  } catch (err) {
    console.error('[findPizzas] База недоступна. Запустите: npm run db:up && npm run db:setup', err);
    return [];
  }
};
