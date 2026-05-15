'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { useFormContext } from 'react-hook-form';
import { FormInput } from '../form';

export const CheckoutDeliveryBlock: React.FC = () => {
  const { register, watch, formState } = useFormContext();
  const deliveryType = watch('deliveryType');
  const pickupError = (formState.errors as { pickupPoint?: { message?: string } }).pickupPoint?.message;

  return (
    <WhiteBlock title="2. Доставка и время" className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="radio" value="DELIVERY" {...register('deliveryType')} />
          Доставка курьером
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="radio" value="PICKUP" {...register('deliveryType')} />
          Самовывоз
        </label>
      </div>
      <label className="text-sm text-neutral-600">
        Предзаказ: желаемое время (необязательно)
        <input
          type="datetime-local"
          className="mt-1 block w-full max-w-xs rounded-md border px-3 py-2 text-base text-neutral-900"
          {...register('scheduledFor')}
        />
      </label>
      {deliveryType === 'DELIVERY' && (
        <p className="text-xs text-neutral-500">Адрес укажите в следующем блоке.</p>
      )}
      {deliveryType === 'PICKUP' && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Выберите удобную точку самовывоза в Оренбурге.</p>
          <select className="block w-full max-w-md rounded-md border px-3 py-2" {...register('pickupPoint')}>
            <option value="">Выберите адрес самовывоза</option>
            <option value="Оренбург, ул. Советская, 52">Оренбург, ул. Советская, 52</option>
            <option value="Оренбург, пр-т Победы, 134">Оренбург, пр-т Победы, 134</option>
            <option value="Оренбург, ул. Чкалова, 36">Оренбург, ул. Чкалова, 36</option>
          </select>
          {pickupError && <p className="text-xs text-red-500">{pickupError}</p>}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <FormInput name="promoCode" label="Промокод (5/10/15%)" placeholder="SAVE10" />
        <FormInput name="bonusToSpend" label="Списать бонусов (₽)" type="number" />
      </div>
      <p className="text-xs text-neutral-500">
        Промокод не действует вместе со списанием бонусов. Бонусы начисляются после оплаты.
      </p>
    </WhiteBlock>
  );
};
