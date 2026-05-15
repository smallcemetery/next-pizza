'use client';

import { cn } from '@/shared/lib/utils';
import React from 'react';
import { Container } from './container';
import Image from 'next/image';
import Link from 'next/link';
import { SearchInput } from './search-input';
import { CartButton } from './cart-button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProfileButton } from './profile-button';
import { AuthModal } from './modals';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Button } from '../ui';

interface Props {
  hasSearch?: boolean;
  hasCart?: boolean;
  className?: string;
}

export const Header: React.FC<Props> = ({ hasSearch = true, hasCart = true, className }) => {
  const router = useRouter();
  const [openAuthModal, setOpenAuthModal] = React.useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  const searchParams = useSearchParams();

  React.useEffect(() => {
    let toastMessage = '';

    if (searchParams.has('paid')) {
      toastMessage = 'Спасибо за заказ!';
    }

    if (searchParams.has('verified')) {
      toastMessage = 'Почта успешно подтверждена!';
    }

    if (toastMessage) {
      setTimeout(() => {
        router.replace('/');
        toast.success(toastMessage, {
          duration: 3000,
        });
      }, 1000);
    }
  }, []);

  return (
    <header className={cn('sticky top-0 z-20 border-b border-white/40', className)}>
      <Container className="flex items-center justify-between py-8">
        {/* Левая часть */}
        <Link href="/">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={35} height={35} />
            <div>
              <h1 className="text-2xl uppercase font-black">Next Pizza</h1>
              <p className="text-sm text-gray-400 leading-3">вкусней уже некуда</p>
            </div>
          </div>
        </Link>

        {hasSearch && (
          <div className="mx-10 flex-1">
            <SearchInput />
          </div>
        )}

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />

          <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />

          {isAdmin && (
            <Link href="/dashboard">
              <Button variant="outline" className="text-sm">
                Админка
              </Button>
            </Link>
          )}

          {hasCart && <CartButton />}
        </div>
      </Container>
    </header>
  );
};
