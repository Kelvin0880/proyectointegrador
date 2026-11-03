import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

/** Escudo de la UNPHU en un círculo blanco */
export function LogoMark({ size = 40, className, priority = false }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/80 shadow-sm', className)}
      style={{ width: size, height: size }}
    >
      <Image src="/logo-unphu.png" alt="Logo de la UNPHU" width={size} height={size} priority={priority} className="size-full object-contain" />
    </span>
  );
}

/** Logo con nombre del sistema. tone: "light" para fondos oscuros, "dark" para fondos claros */
export function Logo({ href = '/', tone = 'dark', size = 40, subtitle = 'Sistema de Inventario', priority = false, className }) {
  const content = (
    <>
      <LogoMark size={size} priority={priority} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn('text-base font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-slate-900')}>UNPHU</span>
        {subtitle && (
          <span className={cn('truncate text-xs font-medium', tone === 'light' ? 'text-brand-100/80' : 'text-slate-500')}>{subtitle}</span>
        )}
      </span>
    </>
  );
  const classes = cn('flex items-center gap-3', className);
  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

const AVATAR_SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' };

export function Avatar({ name = '', size = 'md', className }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800', AVATAR_SIZES[size], className)}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  );
}
