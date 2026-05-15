'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormRegisterValues, formRegisterSchema } from './modals/auth-modal/forms/schemas';
import { User } from '@prisma/client';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';

const ReferralLink: React.FC<{ code: string }> = ({ code }) => {
  const [href, setHref] = React.useState(`/?ref=${code}`);

  React.useEffect(() => {
    setHref(`${window.location.origin}/?ref=${code}`);
  }, [code]);

  return (
    <p>
      <span className="font-bold">Реферальная ссылка:</span>{' '}
      <a href={href} className="break-all text-violet-700 underline">
        {href}
      </a>
    </p>
  );
};

interface Props {
  data: User;
  referralCode?: string;
  bonusBalance?: number;
}

export const ProfileForm: React.FC<Props> = ({ data, referralCode, bonusBalance }) => {
  const form = useForm({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      fullName: data.fullName,
      email: data.email,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: TFormRegisterValues) => {
    try {
      await updateUserInfo({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      toast.success('Данные обновлены', {
        icon: '✅',
      });
    } catch (error) {
      return toast.error('Ошибка при обновлении данных', {
        icon: '❌',
      });
    }
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <Container>
      <Title text={`Личные данные | #${data.id}`} size="md" className="font-bold tracking-tight" />

      {(typeof bonusBalance === 'number' || referralCode) && (
        <div className="mt-4 space-y-2 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm">
          {typeof bonusBalance === 'number' && (
            <p>
              <span className="font-bold">Бонусы:</span> {bonusBalance} | 1 бонус = 1рублю
            </p>
          )}
          {referralCode && <ReferralLink code={referralCode} />}
        </div>
      )}

      <FormProvider {...form}>
        <form
          className="mt-8 flex w-full max-w-md flex-col gap-5 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm"
          onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />

          <FormInput type="password" name="password" label="Новый пароль" required />
          <FormInput type="password" name="confirmPassword" label="Повторите пароль" required />

          <Button disabled={form.formState.isSubmitting} className="text-base mt-10" type="submit">
            Сохранить
          </Button>

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
            className="text-base"
            type="button">
            Выйти
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};
