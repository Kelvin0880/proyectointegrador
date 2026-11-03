'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CircleCheck, className: 'text-emerald-600' },
  error: { icon: CircleAlert, className: 'text-red-600' },
  info: { icon: Info, className: 'text-blue-600' },
};

/** Proveedor de notificaciones flotantes (toasts) */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (tone, title, description) => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-3), { id, tone, title, description }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 4000);
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (title, description) => show('success', title, description),
      error: (title, description) => show('error', title, description),
      info: (title, description) => show('info', title, description),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:items-end sm:p-6"
      >
        {toasts.map((t) => {
          const { icon: Icon, className } = TONES[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-slide-up gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-900/10"
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="-m-1 flex size-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600" aria-label="Cerrar notificación">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
