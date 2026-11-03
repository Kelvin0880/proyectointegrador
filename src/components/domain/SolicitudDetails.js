import { Building2, CalendarDays, Clock, IdCard, Mail, MessageSquareText, Package, UserRound } from 'lucide-react';
import { DescriptionList } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatDateTime, formatTimeRange } from '@/lib/format';
import { SOLICITUD_STATUS, SolicitudEstadoBadge } from './StatusBadges';

/** Línea de tiempo del ciclo de vida de una solicitud */
export function SolicitudTimeline({ solicitud }) {
  const { estado } = solicitud;
  const steps = [
    { key: 'creada', label: 'Solicitud enviada', date: solicitud.fecha_solicitud, done: true },
    estado === 'Rechazada'
      ? { key: 'rechazada', label: 'Rechazada', date: solicitud.updated_at, done: true, tone: 'red' }
      : { key: 'aprobada', label: 'Aprobada', date: estado !== 'Pendiente' ? solicitud.updated_at : null, done: ['Aprobada', 'Finalizada'].includes(estado) },
    estado !== 'Rechazada' && {
      key: 'finalizada',
      label: 'Equipo devuelto',
      date: estado === 'Finalizada' ? solicitud.updated_at : null,
      done: estado === 'Finalizada',
    },
  ].filter(Boolean);

  // Las fechas intermedias no se guardan por separado; solo se muestra la última actualización
  const lastDone = steps.filter((s) => s.done).length - 1;

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span className={cn('absolute left-[7px] top-4 h-full w-0.5', step.done && steps[index + 1]?.done ? 'bg-brand-500' : 'bg-slate-200')} aria-hidden="true" />
            )}
            <span
              className={cn(
                'relative mt-1 size-4 shrink-0 rounded-full border-2',
                step.done
                  ? step.tone === 'red'
                    ? 'border-red-500 bg-red-500'
                    : 'border-brand-600 bg-brand-600'
                  : 'border-slate-300 bg-white'
              )}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', step.done ? 'text-slate-900' : 'text-slate-400')}>{step.label}</p>
              {step.done && (index === 0 || index === lastDone) && step.date && (
                <p className="text-xs text-slate-500">{formatDateTime(step.date)}</p>
              )}
              {!step.done && <p className="text-xs text-slate-400">Pendiente</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Contenido de detalle de una solicitud, compartido por el modal y la página de detalle */
export function SolicitudDetails({ solicitud, showSolicitante = false }) {
  const status = SOLICITUD_STATUS[solicitud.estado];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <SolicitudEstadoBadge estado={solicitud.estado} />
          {status?.description && <span className="text-sm text-slate-500">{status.description}</span>}
        </div>
        <span className="text-xs text-slate-500">Solicitud #{solicitud.id}</span>
      </div>

      <DescriptionList
        items={[
          { label: 'Equipo', value: solicitud.item_nombre, icon: Package },
          { label: 'Departamento', value: solicitud.departamento_nombre, icon: Building2 },
          { label: 'Fecha de uso', value: formatDate(solicitud.fecha_uso), icon: CalendarDays },
          { label: 'Horario', value: formatTimeRange(solicitud.hora_inicio, solicitud.hora_fin), icon: Clock },
          showSolicitante && {
            label: 'Solicitante',
            value: `${solicitud.usuario_nombre} ${solicitud.usuario_apellido}`,
            icon: UserRound,
          },
          showSolicitante && { label: 'Matrícula', value: solicitud.matricula, icon: IdCard },
          showSolicitante && solicitud.usuario_email && { label: 'Correo', value: solicitud.usuario_email, icon: Mail, full: true },
          { label: 'Motivo de uso', value: <span className="whitespace-pre-line">{solicitud.motivo?.trim()}</span>, icon: MessageSquareText, full: true },
        ]}
      />

      {solicitud.comentarios && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Comentarios del administrador</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{solicitud.comentarios.trim()}</p>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Seguimiento</p>
        <SolicitudTimeline solicitud={solicitud} />
      </div>
    </div>
  );
}
