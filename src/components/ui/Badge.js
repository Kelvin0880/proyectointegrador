import { cn } from '@/lib/cn';

const TONES = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  brand: 'bg-brand-50 text-brand-800 ring-brand-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const DOTS = {
  gray: 'bg-slate-400',
  brand: 'bg-brand-600',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
};

export function Badge({ tone = 'gray', icon: Icon, dot = false, size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOTS[tone])} aria-hidden="true" />}
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}
