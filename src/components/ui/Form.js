'use client';
import { forwardRef, useId, useState } from 'react';
import { ChevronDown, CircleAlert, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

const controlBase =
  'block w-full rounded-lg border bg-white text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

function controlClasses(error, extra) {
  return cn(
    controlBase,
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/15',
    extra
  );
}

/**
 * Contenedor de un campo: etiqueta, control, ayuda y mensaje de error.
 * `children` es una función que recibe { id, describedBy, invalid }.
 */
export function Field({ label, hint, error, required, className, labelAction, children }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
              {label}
            </label>
            {required && <span className="ml-0.5 text-sm font-medium text-red-600" aria-hidden="true">*</span>}
          </div>
          {labelAction}
        </div>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ icon: Icon, suffix, error, className, ...props }, ref) {
  return (
    <div className="relative flex">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      )}
      <input
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={controlClasses(error, cn('h-10 px-3', Icon && 'pl-9', suffix && 'rounded-r-none', className))}
        {...props}
      />
      {suffix && (
        <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ error, className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        aria-invalid={error ? 'true' : undefined}
        className={controlClasses(error, cn('h-10 pl-3 pr-10', className))}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-600"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
});

export const Select = forwardRef(function Select({ error, className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={controlClasses(error, cn('h-10 appearance-none pl-3 pr-9', className))}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ error, className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={error ? 'true' : undefined}
      className={controlClasses(error, cn('min-h-24 px-3 py-2', className))}
      {...props}
    />
  );
});

/** Contador de caracteres para textareas */
export function CharCount({ value = '', max }) {
  const length = value.length;
  return (
    <span className={cn('text-xs tabular-nums', length > max ? 'text-red-600' : 'text-slate-400')}>
      {length}/{max}
    </span>
  );
}
