'use client';
import { Suspense, useEffect, useState } from 'react';
import { Check, CheckCheck, ClipboardCheck, Eye, X } from 'lucide-react';
import {
  Avatar, Button, Card, DataTable, EmptyState, ErrorState, FilterTabs, Modal, PageHeader, SearchInput,
} from '@/components/ui';
import { SolicitudEstadoBadge } from '@/components/domain/StatusBadges';
import { SolicitudDetails } from '@/components/domain/SolicitudDetails';
import { SolicitudDecisionModal } from '@/components/domain/SolicitudDecisionModal';
import { useApi } from '@/hooks/useApi';
import { useQueryParam } from '@/hooks/useQueryParam';
import { apiFetch, withQuery } from '@/lib/api-client';
import { SOLICITUD_ESTADOS } from '@/lib/constants';
import { formatDate, formatRelative, formatTimeRange } from '@/lib/format';

const PLURAL = { Pendiente: 'Pendientes', Aprobada: 'Aprobadas', Rechazada: 'Rechazadas', Finalizada: 'Finalizadas' };

function DecisionButtons({ solicitud, onDecide, size = 'sm' }) {
  if (solicitud.estado === 'Pendiente') {
    return (
      <>
        <Button size={size} variant="danger-soft" icon={X} onClick={() => onDecide(solicitud, 'Rechazada')}>
          Rechazar
        </Button>
        <Button size={size} icon={Check} onClick={() => onDecide(solicitud, 'Aprobada')}>
          Aprobar
        </Button>
      </>
    );
  }
  if (solicitud.estado === 'Aprobada') {
    return (
      <Button size={size} variant="soft" icon={CheckCheck} onClick={() => onDecide(solicitud, 'Finalizada')}>
        Devolución
      </Button>
    );
  }
  return null;
}

function AdminSolicitudes() {
  const [estado, setEstado] = useQueryParam('estado');
  const [q, setQ] = useQueryParam('q');
  const [verId, setVerId] = useQueryParam('ver');
  const resumen = useApi('/api/admin/resumen');
  const { data, error, loading, refetch } = useApi(withQuery('/api/solicitudes/admin', { estado, q }));
  const [detalle, setDetalle] = useState(null);
  const [decision, setDecision] = useState({ solicitud: null, estado: null });

  // Abrir el detalle indicado en la URL (?ver=ID)
  useEffect(() => {
    if (!verId) {
      setDetalle(null);
      return;
    }
    let cancelled = false;
    apiFetch(`/api/solicitudes/${verId}`)
      .then((s) => !cancelled && setDetalle(s))
      .catch(() => !cancelled && setVerId(''));
    return () => {
      cancelled = true;
    };
  }, [verId, setVerId]);

  const counts = resumen.data?.solicitudes ?? {};
  const tabs = [{ value: '', label: 'Todas', count: counts.total }, ...SOLICITUD_ESTADOS.map((e) => ({ value: e, label: PLURAL[e], count: counts[e] }))];

  const decide = (solicitud, nuevoEstado) => {
    if (verId) setVerId('');
    setDecision({ solicitud, estado: nuevoEstado });
  };
  const afterDecision = () => {
    refetch();
    resumen.refetch();
  };

  const columns = [
    {
      key: 'usuario',
      header: 'Solicitante',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${s.usuario_nombre} ${s.usuario_apellido}`} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">
              {s.usuario_nombre} {s.usuario_apellido}
            </p>
            <p className="text-xs text-slate-500">{s.matricula}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'equipo',
      header: 'Equipo',
      render: (s) => (
        <div>
          <p className="text-slate-900">{s.item_nombre}</p>
          <p className="text-xs text-slate-500">{s.departamento_nombre}</p>
        </div>
      ),
    },
    {
      key: 'uso',
      header: 'Uso',
      render: (s) => (
        <div className="whitespace-nowrap">
          <p className="text-slate-900">{formatDate(s.fecha_uso, { month: 'short' })}</p>
          <p className="text-xs text-slate-500">{formatTimeRange(s.hora_inicio, s.hora_fin)}</p>
        </div>
      ),
    },
    { key: 'estado', header: 'Estado', render: (s) => <SolicitudEstadoBadge estado={s.estado} /> },
    { key: 'creada', header: 'Recibida', render: (s) => <span className="whitespace-nowrap text-slate-500">{formatRelative(s.fecha_solicitud)}</span>, hideBelow: 'xl' },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <DecisionButtons solicitud={s} onDecide={decide} />
          <Button variant="ghost" size="icon-sm" onClick={() => setVerId(String(s.id))} aria-label={`Ver detalle de la solicitud ${s.id}`} title="Ver detalle">
            <Eye className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Solicitudes" description="Revisa, aprueba y registra la devolución de los préstamos." />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
          <FilterTabs options={tabs} value={estado} onChange={setEstado} label="Filtrar por estado" />
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por equipo, usuario o matrícula" className="xl:w-80" label="Buscar solicitudes" />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable
            caption="Solicitudes de préstamo"
            columns={columns}
            rows={data}
            loading={loading}
            onRowClick={(s) => setVerId(String(s.id))}
            renderMobile={(s) => (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{s.item_nombre}</p>
                    <p className="text-xs text-slate-500">
                      {s.usuario_nombre} {s.usuario_apellido} ({s.matricula})
                    </p>
                  </div>
                  <SolicitudEstadoBadge estado={s.estado} size="sm" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(s.fecha_uso)}, {formatTimeRange(s.hora_inicio, s.hora_fin)}
                </p>
              </div>
            )}
            empty={
              <EmptyState
                icon={ClipboardCheck}
                title={q ? 'Sin resultados' : estado ? `No hay solicitudes ${PLURAL[estado].toLowerCase()}` : 'No hay solicitudes'}
                description={q ? `No encontramos solicitudes que coincidan con "${q}".` : 'Cuando los usuarios envíen solicitudes aparecerán aquí.'}
              />
            }
          />
        )}
      </Card>

      <Modal
        open={Boolean(detalle)}
        onClose={() => setVerId('')}
        title={detalle ? detalle.item_nombre : ''}
        description={detalle ? `Solicitud #${detalle.id}` : ''}
        size="lg"
        footer={
          detalle && (
            <>
              <Button variant="secondary" onClick={() => setVerId('')}>
                Cerrar
              </Button>
              <DecisionButtons solicitud={detalle} onDecide={decide} size="md" />
            </>
          )
        }
      >
        {detalle && <SolicitudDetails solicitud={detalle} showSolicitante />}
      </Modal>

      <SolicitudDecisionModal
        solicitud={decision.solicitud}
        decision={decision.estado}
        onClose={() => setDecision({ solicitud: null, estado: decision.estado })}
        onDone={afterDecision}
      />
    </>
  );
}

export default function AdminSolicitudesPage() {
  return (
    <Suspense fallback={null}>
      <AdminSolicitudes />
    </Suspense>
  );
}
