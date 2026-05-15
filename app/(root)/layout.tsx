import { Header } from '@/shared/components/shared';
import { MascotChatWidget } from '@/shared/components/shared';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Next Pizza | Главная',
};

export default function HomeLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Suspense>
        <Header className="glass-card border-0" />
      </Suspense>
      {children}
      <MascotChatWidget />
      {modal}
    </main>
  );
}
