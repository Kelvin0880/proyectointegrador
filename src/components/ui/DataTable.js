'use client';
import { cn } from '@/lib/cn';
import { Skeleton } from './Feedback';

/**
 * Tabla de datos responsiva.
 * - En pantallas medianas o grandes muestra una tabla.
 * - En móviles muestra tarjetas usando `renderMobile(row)`.
 *
 * columns: [{ key, header, render?(row), className?, align?: 'left' | 'right' | 'center', hideBelow?: 'lg' | 'xl' }]
 */
export function DataTable({ columns, rows, rowKey = 'id', onRowClick, renderMobile, loading = false, empty, caption }) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="ml-auto h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows?.length) return empty ?? null;

  const alignClass = (align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left');
  const hideClass = (hideBelow) => (hideBelow === 'lg' ? 'hidden lg:table-cell' : hideBelow === 'xl' ? 'hidden xl:table-cell' : '');

  return (
    <>
      {/* Vista de tabla (md en adelante) */}
      <div className={cn('overflow-x-auto', renderMobile && 'hidden md:block')}>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn('whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', alignClass(col.align), hideClass(col.hideBelow), col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-brand-50/40')}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-5 py-3.5 align-middle text-slate-700', alignClass(col.align), hideClass(col.hideBelow), col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas (móvil) */}
      {renderMobile && (
        <ul className="divide-y divide-slate-100 md:hidden">
          {rows.map((row) => (
            <li key={row[rowKey]}>
              {onRowClick ? (
                <button type="button" onClick={() => onRowClick(row)} className="block w-full px-4 py-4 text-left active:bg-slate-50">
                  {renderMobile(row)}
                </button>
              ) : (
                <div className="px-4 py-4">{renderMobile(row)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
