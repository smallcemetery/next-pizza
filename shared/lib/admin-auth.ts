import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/constants/auth-options';
import { UserRole } from '@prisma/client';

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return null;
  }
  return session;
}

export async function getUserSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
