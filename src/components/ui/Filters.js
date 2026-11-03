'use client';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Pestañas de filtro con contador opcional */
export function FilterTabs({ options, value, onChange, label = 'Filtrar' }) {
  return (
    <div role="tablist" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-xs tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Campo de búsqueda con espera (debounce): llama a onChange cuando el usuario
 * deja de escribir durante `delay` milisegundos.
 */
export function SearchInput({ value, onChange, placeholder = 'Buscar...', delay = 300, className, label = 'Buscar' }) {
  const [text, setText] = useState(value ?? '');

  useEffect(() => {
    setText(value ?? '');
  }, [value]);

  useEffect(() => {
    if (text === (value ?? '')) return undefined;
    const timer = setTimeout(() => onChange(text), delay);
    return () => clearTimeout(timer);
  }, [text, value, delay, onChange]);

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText('');
            onChange('');
          }}
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
