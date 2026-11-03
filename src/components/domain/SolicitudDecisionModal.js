'use client';
import { useEffect, useState } from 'react';
import { CheckCheck, CircleCheck, CircleX } from 'lucide-react';
import { Button, CharCount, Field, Modal, Textarea, useToast } from '@/components/ui';
import { api } from '@/lib/api-client';
import { formatDate, formatTimeRange } from '@/lib/format';

export const DECISIONES = {
  Aprobada: {
    title: 'Aprobar solicitud',
    description: 'Se prestará una unidad del equipo y se descontará del inventario disponible.',
    confirm: 'Aprobar',
    icon: CircleCheck,
    iconTone: 'brand',
    variant: 'primary',
    placeholder: 'Indicaciones para el retiro del equipo (opcional)',
  },
  Rechazada: {
    title: 'Rechazar solicitud',
    description: 'El usuario verá el motivo del rechazo. Si el equipo estaba prestado, la unidad vuelve al inventario.',
    confirm: 'Rechazar',
    icon: CircleX,
    iconTone: 'danger',
    variant: 'danger',
    placeholder: 'Explica el motivo del rechazo',
    commentRequired: true,
  },
  Finalizada: {
    title: 'Registrar devolución',
    description: 'Confirma que el equipo fue devuelto. La unidad volverá a estar disponible.',
    confirm: 'Registrar devolución',
    icon: CheckCheck,
    iconTone: 'info',
    variant: 'primary',
    placeholder: 'Observaciones sobre la devolución (opcional)',
  },
};

/** Modal para que el administrador apruebe, rechace o finalice una solicitud */
export function SolicitudDecisionModal({ solicitud, decision, onClose, onDone }) {
  const toast = useToast();
  const [comentarios, setComentarios] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const config = DECISIONES[decision];

  useEffect(() => {
    setComentarios('');
    setError(null);
  }, [solicitud?.id, decision]);

  if (!config) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (config.commentRequired && !comentarios.trim()) {
      setError('Escribe el motivo para que el usuario sepa por qué');
      return;
    }
    setSaving(true);
    try {
      const result = await api.patch(`/api/solicitudes/${solicitud.id}`, { estado: decision, comentarios });
      toast.success(result.message);
      onDone?.(result.solicitud);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(solicitud)}
      onClose={saving ? () => {} : onClose}
      title={config.title}
      description={config.description}
      icon={config.icon}
      iconTone={config.iconTone}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="decision-form" variant={config.variant} loading={saving}>
            {config.confirm}
          </Button>
        </>
      }
    >
      {solicitud && (
        <form id="decision-form" onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">{solicitud.item_nombre}</p>
            <p className="mt-0.5 text-slate-600">
              {solicitud.usuario_nombre} {solicitud.usuario_apellido} ({solicitud.matricula})
            </p>
            <p className="mt-0.5 text-slate-500">
              {formatDate(solicitud.fecha_uso)}, {formatTimeRange(solicitud.hora_inicio, solicitud.hora_fin)}
            </p>
          </div>
          <Field
            label={config.commentRequired ? 'Motivo del rechazo' : 'Comentarios'}
            required={config.commentRequired}
            error={error}
            labelAction={<CharCount value={comentarios} max={500} />}
          >
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={comentarios}
                onChange={(e) => {
                  setComentarios(e.target.value);
                  setError(null);
                }}
                maxLength={500}
                placeholder={config.placeholder}
                error={error}
                autoFocus
              />
            )}
          </Field>
        </form>
      )}
    </Modal>
  );
}
