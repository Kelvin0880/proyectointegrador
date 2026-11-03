'use client';
import { useState } from 'react';
import { ChartNoAxesColumn, Table2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

/**
 * Ranking en barras horizontales (una sola serie, un solo color de marca).
 * Incluye vista de tabla equivalente para accesibilidad e impresión.
 * rows: [{ id, label, sublabel, value }]
 */
export function RankingChart({ rows, valueLabel = 'Solicitudes', labelHeader = 'Nombre', sublabelHeader }) {
  const [view, setView] = useState('chart');
  const [hovered, setHovered] = useState(null);
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Tipo de vista">
          {[
            { value: 'chart', label: 'Gráfico', icon: ChartNoAxesColumn },
            { value: 'table', label: 'Tabla', icon: Table2 },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition',
                view === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'chart' ? (
        <ol className="space-y-3" aria-label={`Ranking por ${valueLabel.toLowerCase()}`}>
          {rows.map((row, index) => {
            const pct = (row.value / max) * 100;
            const active = hovered === row.id;
            return (
              <li
                key={row.id}
                className="group relative grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-x-3 sm:grid-cols-[1.75rem_minmax(0,14rem)_minmax(0,1fr)]"
                onMouseEnter={() => setHovered(row.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="text-right text-xs font-semibold tabular-nums text-slate-400">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{row.label}</p>
                  {row.sublabel && <p className="truncate text-xs text-slate-500">{row.sublabel}</p>}
                </div>
                <div className="col-start-2 mt-1.5 flex items-center gap-2 sm:col-start-3 sm:mt-0">
                  <div className="relative h-5 flex-1">
                    <div
                      className={cn('h-full rounded-r-[4px] bg-brand-600 transition-[width,opacity] duration-500', hovered && !active && 'opacity-50')}
                      style={{ width: `${Math.max(pct, 1.5)}%` }}
                    />
                    {active && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute -top-10 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
                        style={{ left: `min(${pct}%, calc(100% - 8rem))` }}
                      >
                        <span className="font-semibold">{row.label}</span>: {formatNumber(row.value)} {valueLabel.toLowerCase()}
                      </div>
                    )}
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">{formatNumber(row.value)}</span>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{labelHeader}</th>
                {sublabelHeader && <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{sublabelHeader}</th>}
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">{valueLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5 tabular-nums text-slate-500">{index + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.label}</td>
                  {sublabelHeader && <td className="px-4 py-2.5 text-slate-600">{row.sublabel}</td>}
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900">{formatNumber(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
