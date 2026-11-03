'use client';
import { useState } from 'react';
import { ArrowRight, Building2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import {
  Alert, Button, Card, CharCount, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader,
  ProgressBar, Skeleton, Textarea, useToast,
} from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { pluralize } from '@/lib/format';
import { firstError, hasErrors, validateDepartamento } from '@/lib/validation';

function DepartamentoFormModal({ departamento, open, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(departamento?.id);
  const [values, setValues] = useState({ nombre: '', descripcion: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastId, setLastId] = useState(undefined);

  // Reiniciar el formulario cada vez que se abre con otro departamento
  const key = open ? departamento?.id ?? 'nuevo' : null;
  if (key !== lastId) {
    setLastId(key);
    setValues({ nombre: departamento?.nombre ?? '', descripcion: departamento?.descripcion ?? '' });
    setErrors({});
    setFormError(null);
  }

  const submit = async (event) => {
    event.preventDefault();
    const validation = validateDepartamento(values);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const result = isEdit ? await api.patch(`/api/departamentos/${departamento.id}`, values) : await api.post('/api/departamentos', values);
      toast.success(result.message);
      onSaved();
      onClose();
    } catch (err) {
      if (err.details) setErrors(err.details);
      setFormError(firstError(err.details ?? {}) ? null : err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Editar departamento' : 'Nuevo departamento'}
      description="Los departamentos agrupan los equipos del inventario."
      icon={Building2}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="departamento-form" icon={Save} loading={saving}>
            {isEdit ? 'Guardar cambios' : 'Crear departamento'}
          </Button>
        </>
      }
    >
      <form id="departamento-form" onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}
        <Field label="Nombre" required error={errors.nombre}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={values.nombre}
              onChange={(e) => {
                setValues((v) => ({ ...v, nombre: e.target.value }));
                setErrors((er) => ({ ...er, nombre: undefined }));
              }}
              maxLength={100}
              placeholder="Ej. Laboratorio de Ciencias"
              error={errors.nombre}
              autoFocus
            />
          )}
        </Field>
        <Field label="Descripción" labelAction={<CharCount value={values.descripcion} max={500} />}>
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={values.descripcion}
              onChange={(e) => setValues((v) => ({ ...v, descripcion: e.target.value }))}
              maxLength={500}
              placeholder="¿Qué tipo de equipos gestiona este departamento?"
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}

export default function DepartamentosPage() {
  const toast = useToast();
  const { data, error, loading, refetch } = useApi('/api/departamentos');
  const [editing, setEditing] = useState({ open: false, departamento: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      const result = await api.delete(`/api/departamentos/${toDelete.id}`);
      toast.success(result.message);
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error('No se pudo eliminar', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Departamentos"
        description="Organiza el inventario por las áreas responsables de cada equipo."
        actions={
          <Button icon={Plus} onClick={() => setEditing({ open: true, departamento: null })}>
            Nuevo departamento
          </Button>
        }
      />

      {error ? (
        <Card>
          <ErrorState message={error} onRetry={refetch} />
        </Card>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No hay departamentos"
            description="Crea el primer departamento para empezar a registrar equipos."
            action={
              <Button icon={Plus} onClick={() => setEditing({ open: true, departamento: null })}>
                Nuevo departamento
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((d) => (
            <li key={d.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Building2 className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ open: true, departamento: d })} aria-label={`Editar ${d.nombre}`} title="Editar">
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(d)} aria-label={`Eliminar ${d.nombre}`} title="Eliminar">
                      <Trash2 className="size-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{d.nombre}</h2>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{d.descripcion || 'Sin descripción'}</p>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>{pluralize(d.total_items, 'equipo')}</span>
                    <span className="tabular-nums">
                      <span className="font-semibold text-slate-800">{d.unidades_disponibles}</span>/{d.total_unidades} unidades
                    </span>
                  </div>
                  <ProgressBar value={d.unidades_disponibles} max={d.total_unidades} label={`Disponibilidad de ${d.nombre}`} />
                </div>
                <Button href={`/dashboard/admin/inventario?departamento=${d.id}`} variant="soft" size="sm" iconRight={ArrowRight} className="mt-5">
                  Ver equipos
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <DepartamentoFormModal
        open={editing.open}
        departamento={editing.departamento}
        onClose={() => setEditing((e) => ({ ...e, open: false }))}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={deleting}
        title="Eliminar departamento"
        description={toDelete ? `¿Seguro que quieres eliminar "${toDelete.nombre}"?` : ''}
        confirmLabel="Eliminar"
      >
        {toDelete?.total_items > 0 && (
          <Alert tone="warning">
            Este departamento tiene {pluralize(toDelete.total_items, 'equipo')}. Debes moverlos o eliminarlos antes de borrar el departamento.
          </Alert>
        )}
      </ConfirmDialog>
    </>
  );
}
