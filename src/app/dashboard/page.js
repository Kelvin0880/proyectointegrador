'use client';
import { useSession } from 'next-auth/react';
import { AdminOverview } from '@/components/dashboard/AdminOverview';
import { UserOverview } from '@/components/dashboard/UserOverview';

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;
  return user.role === 'admin' ? <AdminOverview user={user} /> : <UserOverview user={user} />;
}
