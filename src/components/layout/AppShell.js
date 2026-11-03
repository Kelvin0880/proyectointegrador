'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown, CircleUserRound, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { Avatar, Logo, PageLoader } from '@/components/ui';
import { RolBadge } from '@/components/domain/StatusBadges';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { INSTITUTION } from '@/lib/constants';
import { isActivePath, navigationFor } from './navigation';

function usePendingCount(isAdmin, pathname) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    apiFetch('/api/admin/resumen')
      .then((data) => !cancelled && setCount(data.solicitudes?.Pendiente ?? 0))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin, pathname]);
  return count;
}

function SidebarContent({ user, pathname, pendientes, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <Logo href="/dashboard" tone="light" size={38} priority />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navegación principal">
        {navigationFor(user?.role).map((section) => (
          <div key={section.title} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-200/60">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActivePath(pathname, item);
                const Icon = item.icon;
                const badge = item.badge === 'pendientes' ? pendientes : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-50/85 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className={cn('size-[18px] shrink-0', active ? 'text-brand-700' : 'text-brand-200/70 group-hover:text-white')} aria-hidden="true" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={cn('rounded-full px-2 py-px text-xs font-semibold tabular-nums', active ? 'bg-amber-100 text-amber-800' : 'bg-amber-400 text-amber-950')}
                          aria-label={`${badge} pendientes`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4 text-xs text-brand-100/60">
        <p className="font-medium text-brand-50/80">{INSTITUTION.name}</p>
        <p className="mt-0.5">República Dominicana</p>
      </div>
    </div>
  );
}

function UserMenu({ user }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-lg p-1 pr-2 text-left hover:bg-slate-100 data-open:bg-slate-100" aria-label="Menú de usuario">
        <Avatar name={user.name} size="sm" />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm font-medium text-slate-900">{user.name}</span>
          <span className="block text-xs text-slate-500">{user.matricula}</span>
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-2 w-64 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-900/10 transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-2">
            <RolBadge rol={user.role} />
          </div>
        </div>
        <div className="my-1 h-px bg-slate-100" />
        <MenuItem>
          <Link href="/dashboard/perfil" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 data-focus:bg-slate-100">
            <CircleUserRound className="size-4 text-slate-400" aria-hidden="true" />
            Mi perfil
          </Link>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 data-focus:bg-red-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

/** Estructura del panel: menú lateral (cajón en móvil), barra superior y contenido */
export function AppShell({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;
  const pendientes = usePendingCount(user?.role === 'admin', pathname);

  if (status === 'loading' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader label="Cargando tu sesión..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Menú lateral en móvil */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 transition-opacity duration-200 data-closed:opacity-0" />
        <div className="fixed inset-0 flex">
          <DialogPanel transition className="relative flex w-full max-w-72 flex-1 transition duration-200 ease-out data-closed:-translate-x-full">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute -right-12 top-3 flex size-10 items-center justify-center rounded-lg text-white"
              aria-label="Cerrar menú"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
            <SidebarContent user={user} pathname={pathname} pendientes={pendientes} onNavigate={() => setMobileOpen(false)} />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Menú lateral fijo en escritorio */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent user={user} pathname={pathname} pendientes={pendientes} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <MenuIcon className="size-5" aria-hidden="true" />
          </button>
          <div className="lg:hidden">
            <Logo href="/dashboard" size={32} subtitle={null} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <UserMenu user={user} />
          </div>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
