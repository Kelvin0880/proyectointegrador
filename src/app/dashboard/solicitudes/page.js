'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ClipboardList, ClipboardPlus, Trash2 } from 'lucide-react';
import { Button, Card, ConfirmDialog, DataTable, EmptyState, ErrorState, FilterTabs, PageHeader, useToast } from '@/components/ui';
import { SolicitudEstadoBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { useQueryParam } from '@/hooks/useQueryParam';
import { api, withQuery } from '@/lib/api-client';
import { SOLICITUD_ESTADOS } from '@/lib/constants';
import { formatDate, formatRelative, formatTimeRange } from '@/lib/format';

const PLURAL = { Pendiente: 'Pendientes', Aprobada: 'Aprobadas', Rechazada: 'Rechazadas', Finalizada: 'Finalizadas' };

function MisSolicitudes() {
  const router = useRouter();
  const toast = useToast();
  const [estado, setEstado] = useQueryParam('estado');
  const stats = useApi('/api/solicitudes/stats');
  const { data, error, loading, refetch } = useApi(withQuery('/api/solicitudes', { estado }));
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const counts = stats.data
    ? { '': stats.data.total, Pendiente: stats.data.pendientes, Aprobada: stats.data.aprobadas, Rechazada: stats.data.rechazadas, Finalizada: stats.data.finalizadas }
    : {};
  const tabs = [{ value: '', label: 'Todas' }, ...SOLICITUD_ESTADOS.map((e) => ({ value: e, label: PLURAL[e] }))].map((t) => ({
    ...t,
    count: counts[t.value],
  }));

  const cancel = async () => {
    setCancelling(true);
    try {
      const result = await api.delete(`/api/solicitudes/${toCancel.id}`);
      toast.success(result.message);
      setToCancel(null);
      refetch();
      stats.refetch();
    } catch (err) {
      toast.error('No se pudo cancelar', err.message);
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      key: 'item',
      header: 'Equipo',
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{s.item_nombre}</p>
          <p className="text-xs text-slate-500">{s.departamento_nombre}</p>
        </div>
      ),
    },
    { key: 'fecha', header: 'Fecha de uso', render: (s) => formatDate(s.fecha_uso) },
    { key: 'horario', header: 'Horario', render: (s) => <span className="whitespace-nowrap">{formatTimeRange(s.hora_inicio, s.hora_fin)}</span>, hideBelow: 'lg' },
    { key: 'estado', header: 'Estado', render: (s) => <SolicitudEstadoBadge estado={s.estado} /> },
    { key: 'creada', header: 'Solicitada', render: (s) => <span className="text-slate-500">{formatRelative(s.fecha_solicitud)}</span>, hideBelow: 'xl' },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {s.estado === 'Pendiente' && (
            <Button variant="ghost" size="icon-sm" onClick={() => setToCancel(s)} aria-label={`Cancelar solicitud de ${s.item_nombre}`} title="Cancelar solicitud">
              <Trash2 className="size-4 text-red-600" aria-hidden="true" />
            </Button>
          )}
          <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mis solicitudes"
        description="Consulta el estado y el historial de tus préstamos."
        actions={
          <Button href="/dashboard/nueva-solicitud" icon={ClipboardPlus}>
            Nueva solicitud
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <FilterTabs options={tabs} value={estado} onChange={setEstado} label="Filtrar por estado" />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable
            caption="Mis solicitudes"
            columns={columns}
            rows={data}
            loading={loading}
            onRowClick={(s) => router.push(`/dashboard/solicitudes/${s.id}`)}
            renderMobile={(s) => (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{s.item_nombre}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(s.fecha_uso)}, {formatTimeRange(s.hora_inicio, s.hora_fin)}
                  </p>
                  <div className="mt-2">
                    <SolicitudEstadoBadge estado={s.estado} size="sm" />
                  </div>
                </div>
                <ChevronRight className="mt-1 size-5 text-slate-300" aria-hidden="true" />
              </div>
            )}
            empty={
              <EmptyState
                icon={ClipboardList}
                title={estado ? `No tienes solicitudes ${PLURAL[estado]?.toLowerCase()}` : 'Aún no tienes solicitudes'}
                description={estado ? 'Prueba con otro filtro.' : 'Solicita tu primer equipo y dale seguimiento desde aquí.'}
                action={
                  !estado && (
                    <Button href="/dashboard/nueva-solicitud" icon={ClipboardPlus}>
                      Solicitar un equipo
                    </Button>
                  )
                }
              />
            }
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancelar solicitud"
        description={toCancel ? `Se eliminará tu solicitud de "${toCancel.item_nombre}". Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, cancelar"
        cancelLabel="No, mantener"
      />
    </>
  );
}

export default function MisSolicitudesPage() {
  return (
    <Suspense fallback={null}>
      <MisSolicitudes />
    </Suspense>
  );
}
