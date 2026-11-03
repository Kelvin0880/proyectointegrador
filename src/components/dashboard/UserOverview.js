'use client';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCheck, CircleCheck, CircleX, ClipboardList, ClipboardPlus, Hourglass } from 'lucide-react';
import { Button, Card, CardHeader, EmptyState, ErrorState, PageHeader, ProgressBar, Skeleton, StatCard } from '@/components/ui';
import { SolicitudEstadoBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { formatDate, formatRelative, formatTimeRange, pluralize } from '@/lib/format';

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function UserOverview({ user }) {
  const stats = useApi('/api/solicitudes/stats');
  const solicitudes = useApi('/api/solicitudes');
  const departamentos = useApi('/api/departamentos');
  const firstName = user.name?.split(' ')[0] ?? '';
  const recientes = (solicitudes.data ?? []).slice(0, 5);
  const s = stats.data;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Este es el resumen de tus solicitudes de préstamo."
        actions={
          <Button href="/dashboard/nueva-solicitud" icon={ClipboardPlus}>
            Nueva solicitud
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pendientes" value={s?.pendientes ?? 0} icon={Hourglass} tone="amber" loading={stats.loading} href="/dashboard/solicitudes?estado=Pendiente" hint="En revisión" />
        <StatCard label="Aprobadas" value={s?.aprobadas ?? 0} icon={CircleCheck} tone="green" loading={stats.loading} href="/dashboard/solicitudes?estado=Aprobada" hint="Equipos en tu poder" />
        <StatCard label="Finalizadas" value={s?.finalizadas ?? 0} icon={CheckCheck} tone="blue" loading={stats.loading} href="/dashboard/solicitudes?estado=Finalizada" hint="Devueltos" />
        <StatCard label="Rechazadas" value={s?.rechazadas ?? 0} icon={CircleX} tone="red" loading={stats.loading} href="/dashboard/solicitudes?estado=Rechazada" hint="No aprobadas" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={ClipboardList}
            title="Solicitudes recientes"
            description="Tus últimas solicitudes de préstamo"
            actions={
              recientes.length > 0 && (
                <Button href="/dashboard/solicitudes" variant="ghost" size="sm" iconRight={ArrowRight}>
                  Ver todas
                </Button>
              )
            }
          />
          {solicitudes.error ? (
            <ErrorState message={solicitudes.error} onRetry={solicitudes.refetch} />
          ) : solicitudes.loading ? (
            <div className="space-y-4 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aún no tienes solicitudes"
              description="Cuando solicites un equipo, podrás seguir su estado desde aquí."
              action={
                <Button href="/dashboard/nueva-solicitud" icon={ClipboardPlus}>
                  Solicitar un equipo
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((sol) => (
                <li key={sol.id}>
                  <Link href={`/dashboard/solicitudes/${sol.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{sol.item_nombre}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {formatDate(sol.fecha_uso)}, {formatTimeRange(sol.hora_inicio, sol.hora_fin)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <SolicitudEstadoBadge estado={sol.estado} size="sm" />
                      <span className="text-[11px] text-slate-400">{formatRelative(sol.fecha_solicitud)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader icon={Building2} title="Disponibilidad" description="Unidades listas para préstamo" />
          <div className="space-y-5 p-5 sm:p-6">
            {departamentos.loading
              ? [0, 1].map((i) => <Skeleton key={i} className="h-10 w-full" />)
              : (departamentos.data ?? []).map((d) => (
                  <div key={d.id}>
                    <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-medium text-slate-800">{d.nombre}</span>
                      <span className="tabular-nums text-slate-500">
                        {d.unidades_disponibles}/{d.total_unidades}
                      </span>
                    </div>
                    <ProgressBar value={d.unidades_disponibles} max={d.total_unidades} label={`Disponibilidad de ${d.nombre}`} />
                    <p className="mt-1.5 text-xs text-slate-500">{pluralize(d.total_items, 'equipo')} registrados</p>
                  </div>
                ))}
            <Button href="/dashboard/nueva-solicitud" variant="soft" fullWidth iconRight={ArrowRight}>
              Explorar equipos
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
