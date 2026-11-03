'use client';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

const ICON_TONES = {
  brand: 'bg-brand-50 text-brand-700',
  danger: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
};

/**
 * Ventana modal accesible (foco atrapado, cierre con Escape y clic fuera).
 * En móviles se muestra como hoja inferior.
 */
export function Modal({ open, onClose, title, description, icon: Icon, iconTone = 'brand', size = 'md', footer, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
          <DialogPanel
            transition
            className={cn(
              'relative w-full overflow-hidden rounded-t-2xl bg-white shadow-xl transition duration-200 ease-out sm:rounded-2xl',
              'data-closed:translate-y-4 data-closed:opacity-0 sm:data-closed:translate-y-0 sm:data-closed:scale-95',
              SIZES[size]
            )}
          >
            <div className="flex items-start gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              {Icon && (
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', ICON_TONES[iconTone])}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
                {description && <Description className="mt-1 text-sm text-slate-500">{description}</Description>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-1 flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
