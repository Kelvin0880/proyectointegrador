'use client';
import { useState } from 'react';
import { Package, Save } from 'lucide-react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, CharCount, Field, Input, Select, Textarea } from '@/components/ui';
import { ITEM_ESTADOS } from '@/lib/constants';
import { firstError, hasErrors, validateItem } from '@/lib/validation';

const EMPTY = { nombre: '', descripcion: '', departamento_id: '', cantidad_total: '1', cantidad_disponible: '', estado: 'Disponible' };

/**
 * Formulario de equipo compartido por "Nuevo equipo" y "Editar equipo".
 * onSubmit(values) debe devolver una promesa; si falla con details, se muestran por campo.
 */
export function ItemForm({ initialValues, departamentos = [], mode = 'create', onSubmit, onCancel, prestadas = 0 }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    ...Object.fromEntries(Object.entries(initialValues ?? {}).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])),
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';

  const set = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const payload = {
      ...values,
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      departamento_id: values.departamento_id ? Number(values.departamento_id) : '',
      cantidad_total: values.cantidad_total === '' ? '' : Number(values.cantidad_total),
      cantidad_disponible: values.cantidad_disponible === '' ? (isEdit ? '' : undefined) : Number(values.cantidad_disponible),
    };
    const validation = validateItem(payload);
    if (isEdit && payload.cantidad_disponible === '') validation.cantidad_disponible = 'Indica la cantidad disponible';
    if (hasErrors(validation)) {
      setErrors(validation);
      setFormError(firstError(validation));
      return;
    }
    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Card>
        <CardHeader
          icon={Package}
          title="Información del equipo"
          description={isEdit ? 'Actualiza los datos y las existencias del equipo.' : 'Los campos marcados con * son obligatorios.'}
        />
        <CardBody className="space-y-5">
          {formError && <Alert tone="error">{formError}</Alert>}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del equipo" required error={errors.nombre} className="sm:col-span-2">
              {({ id, describedBy }) => (
                <Input id={id} aria-describedby={describedBy} value={values.nombre} onChange={set('nombre')} maxLength={100} placeholder="Ej. Proyector Epson PowerLite" error={errors.nombre} />
              )}
            </Field>

            <Field label="Departamento" required error={errors.departamento_id}>
              {({ id, describedBy }) => (
                <Select id={id} aria-describedby={describedBy} value={values.departamento_id} onChange={set('departamento_id')} error={errors.departamento_id}>
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Estado" error={errors.estado} hint="Disponible o agotado se calcula según las existencias">
              {({ id, describedBy }) => (
                <Select id={id} aria-describedby={describedBy} value={values.estado === 'En mantenimiento' ? 'En mantenimiento' : 'auto'} onChange={(e) => set('estado')({ target: { value: e.target.value === 'auto' ? 'Disponible' : e.target.value } })}>
                  <option value="auto">Automático según existencias</option>
                  <option value={ITEM_ESTADOS[2]}>En mantenimiento</option>
                </Select>
              )}
            </Field>

            <Field
              label="Descripción"
              required
              error={errors.descripcion}
              className="sm:col-span-2"
              labelAction={<CharCount value={values.descripcion} max={1000} />}
            >
              {({ id, describedBy }) => (
                <Textarea id={id} aria-describedby={describedBy} value={values.descripcion} onChange={set('descripcion')} maxLength={1000} rows={4} placeholder="Características, modelo, accesorios incluidos..." error={errors.descripcion} />
              )}
            </Field>

            <Field label="Cantidad total" required error={errors.cantidad_total} hint={prestadas > 0 ? `Mínimo ${prestadas}: hay unidades prestadas` : 'Unidades que tiene el departamento'}>
              {({ id, describedBy }) => (
                <Input id={id} aria-describedby={describedBy} type="number" inputMode="numeric" min={Math.max(1, prestadas)} value={values.cantidad_total} onChange={set('cantidad_total')} error={errors.cantidad_total} suffix="unidades" />
              )}
            </Field>

            <Field
              label="Cantidad disponible"
              required={isEdit}
              error={errors.cantidad_disponible}
              hint={isEdit ? 'Unidades listas para prestar' : 'Si lo dejas vacío, será igual a la cantidad total'}
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={values.cantidad_disponible}
                  onChange={set('cantidad_disponible')}
                  placeholder={isEdit ? '' : values.cantidad_total}
                  error={errors.cantidad_disponible}
                  suffix="unidades"
                />
              )}
            </Field>
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={saving}>
            {isEdit ? 'Guardar cambios' : 'Registrar equipo'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
