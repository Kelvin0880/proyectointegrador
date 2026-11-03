import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Panel',
};

export default function DashboardLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
