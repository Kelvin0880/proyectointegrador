import Link from 'next/link';
import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-700/60',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:text-slate-400',
  soft: 'bg-brand-50 text-brand-800 hover:bg-brand-100 disabled:opacity-60',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-600/60',
  'danger-soft': 'bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50',
  white: 'bg-white text-brand-800 shadow-sm hover:bg-brand-50',
  'outline-white': 'text-white ring-1 ring-inset ring-white/60 hover:bg-white/10',
};

const SIZES = {
  xs: 'h-7 gap-1 rounded-md px-2 text-xs',
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
  icon: 'size-9 rounded-lg',
  'icon-sm': 'size-8 rounded-md',
};

const ICON_SIZES = { xs: 'size-3.5', sm: 'size-4', md: 'size-4', lg: 'size-5', icon: 'size-5', 'icon-sm': 'size-4' };

/**
 * Botón reutilizable. Si recibe `href` se renderiza como enlace de Next.js.
 * Props: variant, size, icon (componente de lucide), iconRight, loading, fullWidth.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, fullWidth = false,
    href, className, children, disabled, type = 'button', ...props },
  ref
) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  );
  const iconClass = ICON_SIZES[size];
  const content = (
    <>
      {loading ? <LoaderCircle className={cn(iconClass, 'animate-spin')} aria-hidden="true" /> : Icon && <Icon className={iconClass} aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight className={iconClass} aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <Link ref={ref} href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
});
