import React from 'react';
import { WhiteBlock } from './white-block';
import { CheckoutItemDetails } from './checkout-item-details';
import { ArrowRight, Package, Percent, Truck } from 'lucide-react';
import { Button, Skeleton } from '../ui';
import { cn } from '@/shared/lib/utils';
import { calcCheckoutPricing } from '@/shared/lib/checkout-pricing';
import { DeliveryType } from '@prisma/client';

interface Props {
  cartSubtotal: number;
  loading?: boolean;
  className?: string;
  deliveryType: 'DELIVERY' | 'PICKUP';
  promoPercent: number;
  bonusToSpend: number;
}

export const CheckoutSidebar: React.FC<Props> = ({
  cartSubtotal,
  loading,
  className,
  deliveryType,
  promoPercent,
  bonusToSpend,
}) => {
  const dt = deliveryType === 'PICKUP' ? DeliveryType.PICKUP : DeliveryType.DELIVERY;
  const pricing = calcCheckoutPricing({
    cartSubtotal,
    deliveryType: dt,
    promoPercent,
    bonusToSpend,
  });

  return (
    <WhiteBlock className={cn('sticky top-28 p-6', className)}>
      <div className="flex flex-col gap-1">
        <span className="text-lg text-neutral-500">К оплате:</span>
        {loading ? (
          <Skeleton className="h-11 w-48" />
        ) : (
          <span className="h-11 text-[36px] font-extrabold tracking-tight">{pricing.moneyToPay} ₽</span>
        )}
      </div>

      <CheckoutItemDetails
        title={
          <div className="flex items-center">
            <Package size={18} className="mr-2 text-gray-400" />
            Корзина:
          </div>
        }
        value={loading ? <Skeleton className="h-6 w-16 rounded-[6px]" /> : `${cartSubtotal} ₽`}
      />
      <CheckoutItemDetails
        title={
          <div className="flex items-center">
            <Percent size={18} className="mr-2 text-gray-400" />
            Скидка по промокоду:
          </div>
        }
        value={
          loading ? (
            <Skeleton className="h-6 w-16 rounded-[6px]" />
          ) : (
            `${pricing.promoDiscount} ₽ (${promoPercent}%)`
          )
        }
      />
      <CheckoutItemDetails
        title={
          <div className="flex items-center">
            <Truck size={18} className="mr-2 text-gray-400" />
            Доставка:
          </div>
        }
        value={
          loading ? <Skeleton className="h-6 w-16 rounded-[6px]" /> : `${pricing.deliveryFee} ₽`
        }
      />
      <CheckoutItemDetails
        title={<span className="text-gray-400">Списание бонусов</span>}
        value={
          loading ? <Skeleton className="h-6 w-16 rounded-[6px]" /> : `${pricing.bonusApplied} б.`
        }
      />

      <Button
        loading={loading}
        type="submit"
        className="w-full h-14 rounded-2xl mt-6 text-base font-bold">
        Перейти к оплате
        <ArrowRight className="w-5 ml-2" />
      </Button>
    </WhiteBlock>
  );
};
