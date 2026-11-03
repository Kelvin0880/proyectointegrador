import { ArrowLeft, MapPinOff } from 'lucide-react';
import { Button, LogoMark } from '@/components/ui';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <LogoMark size={72} />
      <span className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <MapPinOff className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-slate-600">La dirección que buscas no existe o fue movida. Revisa el enlace o vuelve al inicio.</p>
      <Button href="/" icon={ArrowLeft} className="mt-8">
        Volver al inicio
      </Button>
    </main>
  );
}
