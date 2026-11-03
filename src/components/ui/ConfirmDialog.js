'use client';
import { TriangleAlert, CircleHelp } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

/** Diálogo de confirmación para acciones importantes o irreversibles */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  children,
}) {
  const danger = tone === 'danger';
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      description={description}
      icon={danger ? TriangleAlert : CircleHelp}
      iconTone={danger ? 'danger' : 'brand'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
