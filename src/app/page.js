import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  ArrowRight, BellRing, Boxes, ChartNoAxesColumn, ClipboardCheck, ClipboardPlus, FileText, ShieldCheck, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PublicFooter, PublicHeader } from '@/components/layout/PublicLayout';
import { getSession } from '@/lib/session';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Inventario centralizado',
    text: 'Equipos de Audiovisual y Tecnología con sus existencias siempre actualizadas.',
  },
  {
    icon: ClipboardPlus,
    title: 'Solicitudes en línea',
    text: 'Elige el equipo, la fecha y el horario. Sin formularios en papel ni filas.',
  },
  {
    icon: ClipboardCheck,
    title: 'Aprobación y seguimiento',
    text: 'Los administradores aprueban, rechazan y registran devoluciones con trazabilidad.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Informes en PDF',
    text: 'Rankings de equipos y usuarios por periodo, listos para descargar.',
  },
  {
    icon: ShieldCheck,
    title: 'Acceso seguro',
    text: 'Cuentas con la matrícula institucional y permisos por rol.',
  },
  {
    icon: BellRing,
    title: 'Estado en tiempo real',
    text: 'Consulta en todo momento si tu solicitud está pendiente, aprobada o finalizada.',
  },
];

const STEPS = [
  { icon: UserPlus, title: 'Crea tu cuenta', text: 'Regístrate con tu matrícula de la UNPHU.' },
  { icon: ClipboardPlus, title: 'Solicita un equipo', text: 'Selecciona el departamento, el equipo y el horario de uso.' },
  { icon: FileText, title: 'Retira y devuelve', text: 'Cuando se apruebe, retira el equipo y devuélvelo al terminar.' },
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Portada */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-brand-200">
                Universidad Nacional Pedro Henríquez Ureña
              </p>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Sistema de Inventario <span className="text-brand-700">UNPHU</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 lg:mx-0">
                Solicita y gestiona el préstamo de equipos tecnológicos y audiovisuales de la universidad de forma rápida, ordenada y transparente.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button href="/auth/login" size="lg" iconRight={ArrowRight}>
                  Iniciar sesión
                </Button>
                <Button href="/auth/register" size="lg" variant="secondary">
                  Crear cuenta
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-br from-brand-200 to-brand-50" aria-hidden="true" />
                <Image
                  src="/logo-unphu.png"
                  alt="Escudo de la Universidad Nacional Pedro Henríquez Ureña"
                  width={320}
                  height={322}
                  priority
                  className="relative size-56 rounded-full bg-white shadow-2xl ring-8 ring-white sm:size-72"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-16 sm:py-24" aria-labelledby="caracteristicas">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="caracteristicas" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Todo el proceso de préstamo en un solo lugar
              </h2>
              <p className="mt-4 text-lg text-slate-600">Diseñado para estudiantes, docentes y el personal de cada departamento.</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="bg-slate-50 py-16 sm:py-24" aria-labelledby="como-funciona">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="como-funciona" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cómo funciona
            </h2>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/20">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-brand-700">Paso {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-12 text-center shadow-xl sm:px-12">
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
              <h2 className="relative text-2xl font-bold text-white sm:text-3xl">¿Listo para solicitar tu primer equipo?</h2>
              <p className="relative mx-auto mt-3 max-w-xl text-brand-100/90">Crea tu cuenta con tu matrícula institucional y empieza hoy mismo.</p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/auth/register" variant="white" size="lg">
                  Crear cuenta
                </Button>
                <Button href="/auth/login" variant="outline-white" size="lg">
                  Ya tengo cuenta
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
