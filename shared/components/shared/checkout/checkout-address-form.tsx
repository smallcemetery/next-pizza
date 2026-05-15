'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { FormTextarea } from '../form';
import { AdressInput } from '../address-input';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { ErrorText } from '../error-text';

interface Props {
  className?: string;
}

export const CheckoutAddressForm: React.FC<Props> = ({ className }) => {
  const { control } = useFormContext();
  const deliveryType = useWatch({ control, name: 'deliveryType' });

  return (
    <WhiteBlock title={deliveryType === 'PICKUP' ? '3. Комментарий' : '3. Адрес доставки'} className={className}>
      <div className="flex flex-col gap-5">
        {deliveryType === 'DELIVERY' && (
          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <>
                <AdressInput onChange={field.onChange} />
                {fieldState.error?.message && <ErrorText text={fieldState.error.message} />}
              </>
            )}
          />
        )}

        <FormTextarea
          name="comment"
          className="text-base"
          placeholder="Комментарий к заказу"
          rows={5}
        />
      </div>
    </WhiteBlock>
  );
};
