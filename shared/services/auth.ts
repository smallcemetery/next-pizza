import { UserRole } from '@prisma/client';
import { axiosInstance } from './instance';

export type MeUser = {
  id: number;
  fullName: string;
  email: string;
  bonusBalance: number;
  referralCode: string;
  role: UserRole;
};

export const getMe = async () => {
  const { data } = await axiosInstance.get<MeUser>('/auth/me');

  return data;
};
