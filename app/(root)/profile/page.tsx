import { prisma } from '@/prisma/prisma-client';
import { ProfileForm } from '@/shared/components';
import { ProfileCustomerPanel } from '@/shared/components/shared/profile-customer-panel';
import { getUserSession } from '@/shared/lib/get-user-session';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

  if (!user) {
    return redirect('/not-auth');
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[380px_1fr]">
      <div>
        <ProfileCustomerPanel />
      </div>
      <ProfileForm data={user} referralCode={user.referralCode} bonusBalance={user.bonusBalance} />
    </div>
  );
}
