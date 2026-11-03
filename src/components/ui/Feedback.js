import { CircleAlert, CircleCheck, Info, TriangleAlert, LoaderCircle, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

const ALERT_TONES = {
  info: { box: 'bg-blue-50 text-blue-800 ring-blue-600/15', icon: Info },
  success: { box: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15', icon: CircleCheck },
  warning: { box: 'bg-amber-50 text-amber-900 ring-amber-600/20', icon: TriangleAlert },
  error: { box: 'bg-red-50 text-red-800 ring-red-600/15', icon: CircleAlert },
};

export function Alert({ tone = 'info', title, children, onDismiss, action, className }) {
  const { box, icon: Icon } = ALERT_TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl p-4 ring-1 ring-inset', box, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1', 'opacity-90')}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 flex size-7 items-center justify-center rounded-md opacity-60 hover:opacity-100" aria-label="Cerrar aviso">
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function Spinner({ className, label = 'Cargando' }) {
  return (
    <span role="status" className="inline-flex items-center">
      <LoaderCircle className={cn('size-5 animate-spin text-brand-700', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ label = 'Cargando...' }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <Spinner className="size-8" />
      <p>{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70', className)} aria-hidden="true" />;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}>
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-8 ring-brand-50/40">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Mensaje de error de carga con botón para reintentar */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-slate-900">No se pudo cargar la información</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}
