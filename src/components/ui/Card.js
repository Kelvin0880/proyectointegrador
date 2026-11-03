import { cn } from '@/lib/cn';

export function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, icon: Icon, actions, className, children }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          {children}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-5 sm:px-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6', className)}>
      {children}
    </div>
  );
}
