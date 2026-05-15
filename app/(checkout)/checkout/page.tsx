'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  CheckoutSidebar,
  Container,
  Title,
  CheckoutAddressForm,
  CheckoutCart,
  CheckoutPersonalForm,
} from '@/shared/components';
import { CheckoutDeliveryBlock } from '@/shared/components';
import { CheckoutFormValues, checkoutFormSchema } from '@/shared/constants';
import { useCart } from '@/shared/hooks';
import { createOrder } from '@/app/actions';
import toast from 'react-hot-toast';
import React from 'react';
import { useSession } from 'next-auth/react';
import { Api } from '@/shared/services/api-client';

export default function CheckoutPage() {
  const [submitting, setSubmitting] = React.useState(false);
  const { totalAmount, updateItemQuantity, items, removeCartItem, loading } = useCart();
  const { data: session } = useSession();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      comment: '',
      deliveryType: 'DELIVERY',
      pickupPoint: '',
      scheduledFor: '',
      promoCode: '',
      bonusToSpend: 0,
    },
  });

  const deliveryType = form.watch('deliveryType');
  const promoCode = form.watch('promoCode');
  const bonusToSpend = form.watch('bonusToSpend');

  const [promoPercent, setPromoPercent] = React.useState(0);

  React.useEffect(() => {
    async function fetchUserInfo() {
      try {
        const data = await Api.auth.getMe();
        const [firstName = '', lastName = ''] = data.fullName.split(' ');
        form.setValue('firstName', firstName);
        form.setValue('lastName', lastName);
        form.setValue('email', data.email);
      } catch {
        // Не показываем всплывающую ошибку при неуспешном автозаполнении профиля.
      }
    }

    if (session) {
      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- заполняем форму один раз при появлении сессии
  }, [session]);

  React.useEffect(() => {
    if (bonusToSpend > 0) {
      setPromoPercent(0);
      return;
    }
    const q = promoCode?.trim();
    if (!q) {
      setPromoPercent(0);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/promo/lookup?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setPromoPercent(Number(d.percent) || 0));
    }, 400);
    return () => clearTimeout(t);
  }, [promoCode, bonusToSpend]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setSubmitting(true);

      const { paymentUrl, orderId } = await createOrder(data);

      toast.success(paymentUrl ? 'Переход на оплату...' : 'Заказ оплачен бонусами!', {
        icon: '✅',
      });

      if (paymentUrl) {
        location.href = paymentUrl;
      } else {
        location.href = `/?paid=1&orderId=${orderId}&snake=1`;
      }
    } catch (err) {
      console.log(err);
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Не удалось создать заказ';
      toast.error(msg, {
        icon: '❌',
      });
    }
  };

  const onInvalid = () => {
    toast.error('Проверьте поля формы перед оплатой', { icon: '⚠️' });
  };

  const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
    const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
    updateItemQuantity(id, newQuantity);
  };

  return (
    <Container className="mt-10">
      <Title text="Оформление заказа" className="font-extrabold mb-8 text-[36px]" />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex flex-col gap-10 flex-1 mb-20">
              <CheckoutCart
                onClickCountButton={onClickCountButton}
                removeCartItem={removeCartItem}
                items={items}
                loading={loading}
              />

              <CheckoutPersonalForm className={loading ? 'opacity-40 pointer-events-none' : ''} />

              <CheckoutDeliveryBlock />

              <CheckoutAddressForm className={loading ? 'opacity-40 pointer-events-none' : ''} />
            </div>

            <div className="w-full lg:w-[450px]">
              <CheckoutSidebar
                cartSubtotal={totalAmount}
                loading={loading || submitting}
                deliveryType={deliveryType}
                promoPercent={promoPercent}
                bonusToSpend={Number(bonusToSpend) || 0}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </Container>
  );
}
