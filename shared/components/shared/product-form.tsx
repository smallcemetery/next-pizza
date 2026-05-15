'use client';

import { ProductWithRelations } from '@/@types/prisma';
import { useCartStore } from '@/shared/store';
import React from 'react';
import toast from 'react-hot-toast';
import { BuilderType } from '@prisma/client';
import { ChoosePizzaForm } from './choose-pizza-form';
import { ChooseProductForm } from './choose-product-form';
import { LemonadeBuilderForm } from './lemonade-builder-form';

interface Props {
  product: ProductWithRelations;
  onSubmit?: VoidFunction;
}

export const ProductForm: React.FC<Props> = ({ product, onSubmit: _onSubmit }) => {
  const [addCartItem, loading] = useCartStore((state) => [state.addCartItem, state.loading]);

  const firstItem = product.items[0];
  const isPizzaForm = Boolean(firstItem.pizzaType);

  const onSubmit = async (
    productItemId?: number,
    ingredients?: number[],
    builderPayload?: Record<string, unknown> | null,
  ) => {
    try {
      const itemId = productItemId ?? firstItem.id;

      await addCartItem({
        productItemId: itemId,
        ingredients,
        builderPayload: builderPayload ?? undefined,
      });

      toast.success(product.name + ' добавлена в корзину');

      _onSubmit?.();
    } catch (err) {
      toast.error('Не удалось добавить товар в корзину');
      console.error(err);
    }
  };

  if (product.builderType === BuilderType.LEMONADE) {
    return (
      <LemonadeBuilderForm
        imageUrl={product.imageUrl}
        name={product.name}
        basePrice={firstItem.price}
        productItemId={firstItem.id}
        loading={loading}
        onSubmit={(payload) => onSubmit(payload.productItemId, payload.ingredients, payload.builderPayload)}
      />
    );
  }

  if (isPizzaForm) {
    return (
      <ChoosePizzaForm
        imageUrl={product.imageUrl}
        name={product.name}
        ingredients={product.ingredients}
        items={product.items}
        onSubmit={onSubmit}
        loading={loading}
      />
    );
  }

  return (
    <ChooseProductForm
      imageUrl={product.imageUrl}
      name={product.name}
      onSubmit={onSubmit}
      price={firstItem.price}
      loading={loading}
    />
  );
};
