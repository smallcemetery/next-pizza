import {
  Container,
  Filters,
  Title,
  TopBar,
  ProductsGroupList,
} from '@/shared/components/shared';
import { HomeLuckyBar } from '@/shared/components/shared/home-lucky-bar';
import { PostCheckoutSnakeGate } from '@/shared/components/shared/post-checkout-snake-gate';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { GetSearchParams, findPizzas } from '@/shared/lib/find-pizzas';

const StoriesLazy = dynamic(
  () => import('@/shared/components/shared/stories').then((m) => m.Stories),
  {
    ssr: false,
    loading: () => (
      <Container className="flex items-center justify-between gap-2 my-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-[200px] h-[250px] bg-gray-200 rounded-md animate-pulse"
          />
        ))}
      </Container>
    ),
  },
);

export default async function Home({ searchParams }: { searchParams: GetSearchParams }) {
  const categories = await findPizzas(searchParams);

  return (
    <>
      <PostCheckoutSnakeGate />
      <section className="parallax-hero mt-8 mb-8">
        <Container className="glass-card rounded-[32px] px-8 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Title text="Все пиццы" size="lg" className="font-extrabold" />
            <HomeLuckyBar />
          </div>
          <p className="mt-3 max-w-2x1 text-sm text-neutral-600">
            Соберите заказ за пару кликов.</p>
        </Container>
      </section>

      <TopBar categories={categories.filter((category) => category.products.length > 0)} />

      <StoriesLazy />

      <Container className="mt-10 pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-[56px]">
          {/* Фильтрация */}
          <div className="w-full lg:sticky lg:top-28 lg:h-fit lg:w-[280px]">
            <Suspense>
              <Filters />
            </Suspense>
          </div>

          {/* Список товаров */}
          <div className="flex-1">
            <div className="flex flex-col gap-16">
              {categories.map(
                (category) =>
                  category.products.length > 0 && (
                    <ProductsGroupList
                      key={category.id}
                      title={category.name}
                      categoryId={category.id}
                      items={category.products}
                    />
                  ),
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
