'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, CheckCheck, RotateCcw, Trash2, X } from 'lucide-react';
import { Button, Card, CardBody, ConfirmDialog, ErrorState, PageHeader, PageLoader, useToast } from '@/components/ui';
import { SolicitudDetails } from '@/components/domain/SolicitudDetails';
import { SolicitudDecisionModal } from '@/components/domain/SolicitudDecisionModal';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api-client';

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const { data: solicitud, error, loading, refetch, setData } = useApi(`/api/solicitudes/${id}`);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [decision, setDecision] = useState(null);

  const isOwner = solicitud && String(solicitud.usuario_id) === String(session?.user?.id);

  const cancel = async () => {
    setCancelling(true);
    try {
      const result = await api.delete(`/api/solicitudes/${id}`);
      toast.success(result.message);
      router.push('/dashboard/solicitudes');
    } catch (err) {
      toast.error('No se pudo cancelar', err.message);
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader label="Cargando solicitud..." />;

  if (error) {
    return (
      <>
        <PageHeader title="Solicitud" backHref="/dashboard/solicitudes" backLabel="Mis solicitudes" />
        <Card>
          <ErrorState message={error} onRetry={refetch} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={solicitud.item_nombre}
        description={`Solicitud #${solicitud.id} en ${solicitud.departamento_nombre}`}
        backHref={isOwner ? '/dashboard/solicitudes' : '/dashboard/admin/solicitudes'}
        backLabel={isOwner ? 'Mis solicitudes' : 'Solicitudes'}
        actions={
          <>
            {isOwner && solicitud.estado === 'Pendiente' && (
              <Button variant="danger-soft" icon={Trash2} onClick={() => setConfirmCancel(true)}>
                Cancelar solicitud
              </Button>
            )}
            {isOwner && ['Finalizada', 'Rechazada'].includes(solicitud.estado) && (
              <Button variant="secondary" icon={RotateCcw} href={`/dashboard/nueva-solicitud?item=${solicitud.item_id}`}>
                Solicitar de nuevo
              </Button>
            )}
            {isAdmin && solicitud.estado === 'Pendiente' && (
              <>
                <Button variant="danger-soft" icon={X} onClick={() => setDecision('Rechazada')}>
                  Rechazar
                </Button>
                <Button icon={Check} onClick={() => setDecision('Aprobada')}>
                  Aprobar
                </Button>
              </>
            )}
            {isAdmin && solicitud.estado === 'Aprobada' && (
              <Button icon={CheckCheck} onClick={() => setDecision('Finalizada')}>
                Registrar devolución
              </Button>
            )}
          </>
        }
      />

      <Card className="max-w-3xl">
        <CardBody>
          <SolicitudDetails solicitud={solicitud} showSolicitante={isAdmin && !isOwner} />
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancelar solicitud"
        description="Se eliminará esta solicitud. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="No, mantener"
      />

      <SolicitudDecisionModal
        solicitud={decision ? solicitud : null}
        decision={decision}
        onClose={() => setDecision(null)}
        onDone={(updated) => updated && setData(updated)}
      />
    </>
  );
}
