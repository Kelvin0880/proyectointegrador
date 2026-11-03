import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button, Logo, LogoMark } from '@/components/ui';
import { INSTITUTION } from '@/lib/constants';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo href="/" priority />
        <nav className="flex items-center gap-2" aria-label="Acceso">
          <div className="hidden sm:block">
            <Button href="/auth/login" variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </div>
          <Button href="/auth/register" size="sm">
            Crear cuenta
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-brand-950 text-brand-100/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <p className="font-semibold text-white">{INSTITUTION.name}</p>
            <p className="text-sm">Sistema de Inventario y Préstamo de Equipos</p>
          </div>
        </div>
        <div className="text-sm md:text-right">
          <p>Santo Domingo, República Dominicana</p>
          <p className="mt-1">
            {new Date().getFullYear()} {INSTITUTION.shortName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

const BENEFITS = [
  'Solicita equipos en menos de un minuto',
  'Consulta el estado de tus préstamos en tiempo real',
  'Inventario actualizado por departamento',
];

/** Pantalla dividida para inicio de sesión y registro */
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-700/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />

        <Logo href="/" tone="light" size={48} />

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            Los equipos que necesitas para tus clases, a un clic.
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-brand-50/90">
                <CircleCheck className="size-5 shrink-0 text-brand-300" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-100/60">{INSTITUTION.name}</p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <LogoMark size={88} priority />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
