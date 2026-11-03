'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Boxes, Building2, Check, CircleCheck, ClipboardCheck, Hourglass, PackagePlus, TriangleAlert, Users, X,
} from 'lucide-react';
import { Avatar, Button, Card, CardHeader, EmptyState, ErrorState, PageHeader, ProgressBar, Skeleton, StatCard } from '@/components/ui';
import { ItemEstadoBadge } from '@/components/domain/StatusBadges';
import { SolicitudDecisionModal } from '@/components/domain/SolicitudDecisionModal';
import { useApi } from '@/hooks/useApi';
import { formatDate, formatNumber, formatRelative, formatTimeRange } from '@/lib/format';

export function AdminOverview({ user }) {
  const { data, error, loading, refetch } = useApi('/api/admin/resumen');
  const [decision, setDecision] = useState({ solicitud: null, estado: null });

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={refetch} />
      </Card>
    );
  }

  const sol = data?.solicitudes;
  const inv = data?.inventario;

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description={`Hola, ${user.name?.split(' ')[0]}. Este es el estado actual del inventario y las solicitudes.`}
        actions={
          <>
            <Button href="/dashboard/admin/inventario/nuevo" variant="secondary" icon={PackagePlus}>
              Nuevo equipo
            </Button>
            <Button href="/dashboard/admin/solicitudes" icon={ClipboardCheck}>
              Gestionar solicitudes
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Por revisar" value={sol?.Pendiente ?? 0} icon={Hourglass} tone="amber" loading={loading} href="/dashboard/admin/solicitudes?estado=Pendiente" hint="Solicitudes pendientes" />
        <StatCard label="Préstamos activos" value={sol?.Aprobada ?? 0} icon={CircleCheck} tone="green" loading={loading} href="/dashboard/admin/solicitudes?estado=Aprobada" hint="Equipos fuera" />
        <StatCard
          label="Unidades disponibles"
          value={loading ? 0 : `${formatNumber(inv?.unidades_disponibles)}`}
          icon={Boxes}
          tone="brand"
          loading={loading}
          href="/dashboard/admin/inventario"
          hint={inv ? `de ${formatNumber(inv.unidades_totales)} en ${inv.equipos} equipos` : null}
        />
        <StatCard label="Usuarios" value={data?.usuarios?.total ?? 0} icon={Users} tone="blue" loading={loading} href="/dashboard/admin/usuarios" hint={data ? `${data.usuarios.administradores} administradores` : null} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            icon={Hourglass}
            title="Solicitudes por revisar"
            description="Las más antiguas primero"
            actions={
              <Button href="/dashboard/admin/solicitudes?estado=Pendiente" variant="ghost" size="sm" iconRight={ArrowRight}>
                Ver todas
              </Button>
            }
          />
          {loading ? (
            <div className="space-y-4 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data.pendientesRecientes.length === 0 ? (
            <EmptyState icon={CircleCheck} title="Todo al día" description="No hay solicitudes pendientes de revisión." compact />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.pendientesRecientes.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <Link href={`/dashboard/admin/solicitudes?ver=${s.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={`${s.usuario_nombre} ${s.usuario_apellido}`} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{s.item_nombre}</p>
                      <p className="truncate text-xs text-slate-500">
                        {s.usuario_nombre} {s.usuario_apellido} · {formatDate(s.fecha_uso)}, {formatTimeRange(s.hora_inicio, s.hora_fin)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 sm:ml-4">
                    <span className="mr-1 hidden text-xs text-slate-400 md:inline">{formatRelative(s.fecha_solicitud)}</span>
                    <Button size="sm" variant="danger-soft" icon={X} onClick={() => setDecision({ solicitud: s, estado: 'Rechazada' })}>
                      Rechazar
                    </Button>
                    <Button size="sm" icon={Check} onClick={() => setDecision({ solicitud: s, estado: 'Aprobada' })}>
                      Aprobar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            icon={TriangleAlert}
            title="Existencias bajas"
            description="Equipos con 20% o menos disponible"
          />
          {loading ? (
            <div className="space-y-4 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data.stockBajo.length === 0 ? (
            <EmptyState icon={Boxes} title="Existencias saludables" description="Ningún equipo está por agotarse." compact />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.stockBajo.map((item) => (
                <li key={item.id}>
                  <Link href={`/dashboard/admin/inventario/editar/${item.id}`} className="block px-5 py-3.5 hover:bg-slate-50 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{item.nombre}</p>
                      <ItemEstadoBadge estado={item.estado} size="sm" />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={item.cantidad_disponible} max={item.cantidad_total} label={`Disponibilidad de ${item.nombre}`} />
                      <span className="shrink-0 text-xs tabular-nums text-slate-500">
                        {item.cantidad_disponible}/{item.cantidad_total}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          icon={Building2}
          title="Inventario por departamento"
          actions={
            <Button href="/dashboard/admin/departamentos" variant="ghost" size="sm" iconRight={ArrowRight}>
              Departamentos
            </Button>
          }
        />
        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {loading
            ? [0, 1].map((i) => <Skeleton key={i} className="h-16 w-full" />)
            : data.departamentos.map((d) => (
                <Link key={d.id} href={`/dashboard/admin/inventario?departamento=${d.id}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-slate-900">{d.nombre}</p>
                    <p className="text-xs text-slate-500">{d.equipos} equipos</p>
                  </div>
                  <ProgressBar className="mt-3" value={d.unidades_disponibles} max={d.unidades_totales} label={`Disponibilidad de ${d.nombre}`} />
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 tabular-nums">{d.unidades_disponibles}</span> de {d.unidades_totales} unidades disponibles
                  </p>
                </Link>
              ))}
        </div>
      </Card>

      <SolicitudDecisionModal
        solicitud={decision.solicitud}
        decision={decision.estado}
        onClose={() => setDecision({ solicitud: null, estado: decision.estado })}
        onDone={refetch}
      />
    </>
  );
}
