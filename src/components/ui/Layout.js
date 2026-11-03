import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Encabezado de página: título, descripción, enlace para volver y acciones */
export function PageHeader({ title, description, backHref, backLabel = 'Volver', actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const STAT_TONES = {
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  slate: 'bg-slate-100 text-slate-600',
};

/** Tarjeta de indicador numérico. Si recibe `href` toda la tarjeta es un enlace. */
export function StatCard({ label, value, icon: Icon, tone = 'brand', hint, href, loading = false }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', STAT_TONES[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-1 h-9 w-16 animate-pulse rounded-md bg-slate-200/70" aria-hidden="true" />
      ) : (
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      )}
      {(hint || href) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          {hint}
          {href && <ArrowUpRight className="size-3.5 text-slate-400 transition-colors group-hover:text-brand-700" aria-hidden="true" />}
        </p>
      )}
    </>
  );
  const classes = 'group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
  if (href) {
    return (
      <Link href={href} className={cn(classes, 'transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md')}>
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
}

/** Barra de progreso para disponibilidad de unidades */
export function ProgressBar({ value, max, className, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const tone = pct === 0 ? 'bg-red-500' : pct <= 20 ? 'bg-amber-500' : 'bg-brand-600';
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Lista de pares etiqueta / valor */
export function DescriptionList({ items, columns = 2, className }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-5', columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : '', className)}>
      {items.filter(Boolean).map(({ label, value, icon: Icon, full }) => (
        <div key={label} className={cn(full && 'sm:col-span-full')}>
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {label}
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{value ?? '-'}</dd>
        </div>
      ))}
    </dl>
  );
}
