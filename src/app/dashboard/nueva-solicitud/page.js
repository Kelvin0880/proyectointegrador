'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Check, Clock, PackageSearch, Send } from 'lucide-react';
import {
  Alert, Button, Card, CardBody, CardHeader, CharCount, EmptyState, ErrorState, Field, FilterTabs, Input,
  PageHeader, SearchInput, Skeleton, Textarea, useToast,
} from '@/components/ui';
import { ItemEstadoBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { api, withQuery } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatDate, formatTimeRange, todayISO } from '@/lib/format';
import { firstError, hasErrors, validateSolicitud } from '@/lib/validation';

const INITIAL = { fecha_uso: '', hora_inicio: '', hora_fin: '', motivo: '' };

function ItemOption({ item, selected, onSelect }) {
  const unavailable = item.cantidad_disponible <= 0 || item.estado === 'En mantenimiento';
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      disabled={unavailable}
      aria-pressed={selected}
      className={cn(
        'relative flex h-full flex-col rounded-xl border p-4 text-left transition',
        selected
          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-600'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm',
        unavailable && 'cursor-not-allowed opacity-60 hover:border-slate-200 hover:shadow-none'
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand-700 text-white">
          <Check className="size-4" aria-hidden="true" />
        </span>
      )}
      <p className="pr-8 text-sm font-semibold text-slate-900">{item.nombre}</p>
      <p className="mt-1 line-clamp-2 flex-1 text-xs text-slate-500">{item.descripcion}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <ItemEstadoBadge estado={item.estado} size="sm" />
        <span className="text-xs text-slate-500">
          <span className="font-semibold tabular-nums text-slate-800">{item.cantidad_disponible}</span> disponibles
        </span>
      </div>
    </button>
  );
}

function NuevaSolicitudForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('item');

  const departamentos = useApi('/api/departamentos');
  const [departamentoId, setDepartamentoId] = useState('');
  const [q, setQ] = useState('');
  const items = useApi(withQuery('/api/items', { departamento_id: departamentoId, q }));

  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const today = useMemo(() => todayISO(), []);

  // Preselección desde ?item=ID
  useEffect(() => {
    if (!preselectedId || selected || !items.data) return;
    const match = items.data.find((i) => String(i.id) === preselectedId);
    if (match && match.cantidad_disponible > 0) setSelected(match);
  }, [preselectedId, items.data, selected]);

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const selectItem = (item) => {
    setSelected(item);
    setErrors((current) => ({ ...current, item_id: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const payload = { ...values, item_id: selected?.id };
    const validation = validateSolicitud(payload, { today });
    if (hasErrors(validation)) {
      setErrors(validation);
      setFormError(firstError(validation));
      return;
    }
    setSaving(true);
    try {
      const result = await api.post('/api/solicitudes', payload);
      toast.success('Solicitud enviada', 'Te avisaremos aquí mismo cuando un administrador la revise.');
      router.push(`/dashboard/solicitudes/${result.id}`);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setFormError(err.message);
      setSaving(false);
      items.refetch();
    }
  };

  const tabs = [
    { value: '', label: 'Todos' },
    ...(departamentos.data ?? []).map((d) => ({ value: String(d.id), label: d.nombre })),
  ];

  return (
    <>
      <PageHeader
        title="Nueva solicitud"
        description="Elige el equipo que necesitas e indica cuándo y para qué lo usarás."
        backHref="/dashboard"
        backLabel="Volver al inicio"
      />

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader icon={PackageSearch} title="1. Selecciona el equipo" description="Solo puedes solicitar equipos con unidades disponibles." />
            <CardBody className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {departamentos.loading ? <Skeleton className="h-8 w-64" /> : <FilterTabs options={tabs} value={departamentoId} onChange={setDepartamentoId} label="Departamento" />}
                <SearchInput value={q} onChange={setQ} placeholder="Buscar equipo..." className="sm:w-64" label="Buscar equipo" />
              </div>

              {errors.item_id && <Alert tone="error">{errors.item_id}</Alert>}

              {items.error ? (
                <ErrorState message={items.error} onRetry={items.refetch} />
              ) : items.loading ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : items.data.length === 0 ? (
                <EmptyState icon={PackageSearch} title="No se encontraron equipos" description="Prueba con otra búsqueda o con otro departamento." compact />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="list">
                  {items.data.map((item) => (
                    <div role="listitem" key={item.id}>
                      <ItemOption item={item} selected={selected?.id === item.id} onSelect={selectItem} />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={CalendarDays} title="2. Fecha, horario y motivo" />
            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Fecha de uso" required error={errors.fecha_uso}>
                  {({ id, describedBy }) => (
                    <Input id={id} aria-describedby={describedBy} type="date" min={today} value={values.fecha_uso} onChange={set('fecha_uso')} error={errors.fecha_uso} />
                  )}
                </Field>
                <Field label="Hora de inicio" required error={errors.hora_inicio}>
                  {({ id, describedBy }) => (
                    <Input id={id} aria-describedby={describedBy} type="time" value={values.hora_inicio} onChange={set('hora_inicio')} error={errors.hora_inicio} />
                  )}
                </Field>
                <Field label="Hora de fin" required error={errors.hora_fin}>
                  {({ id, describedBy }) => (
                    <Input id={id} aria-describedby={describedBy} type="time" value={values.hora_fin} onChange={set('hora_fin')} error={errors.hora_fin} />
                  )}
                </Field>
              </div>
              <Field label="Motivo de uso" required error={errors.motivo} labelAction={<CharCount value={values.motivo} max={500} />} hint="Por ejemplo: presentación de la asignatura, evento o práctica de laboratorio.">
                {({ id, describedBy }) => (
                  <Textarea id={id} aria-describedby={describedBy} value={values.motivo} onChange={set('motivo')} maxLength={500} rows={4} placeholder="Describe brevemente para qué necesitas el equipo" error={errors.motivo} />
                )}
              </Field>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader title="Resumen" />
            <CardBody className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Equipo</p>
                {selected ? (
                  <>
                    <p className="mt-1 font-semibold text-slate-900">{selected.nombre}</p>
                    <p className="text-slate-500">{selected.departamento_nombre}</p>
                  </>
                ) : (
                  <p className="mt-1 text-slate-400">Ninguno seleccionado</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</p>
                <p className={cn('mt-1', values.fecha_uso ? 'text-slate-900' : 'text-slate-400')}>
                  {values.fecha_uso ? formatDate(`${values.fecha_uso}T00:00:00`) : 'Sin definir'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Horario</p>
                <p className={cn('mt-1 flex items-center gap-1.5', values.hora_inicio && values.hora_fin ? 'text-slate-900' : 'text-slate-400')}>
                  <Clock className="size-4" aria-hidden="true" />
                  {values.hora_inicio && values.hora_fin ? formatTimeRange(values.hora_inicio, values.hora_fin) : 'Sin definir'}
                </p>
              </div>

              {formError && <Alert tone="error">{formError}</Alert>}

              <Button type="submit" fullWidth size="lg" icon={Send} loading={saving}>
                Enviar solicitud
              </Button>
              <p className="text-center text-xs text-slate-500">Un administrador revisará tu solicitud y verás su estado en Mis solicitudes.</p>
            </CardBody>
          </Card>
        </div>
      </form>
    </>
  );
}

export default function NuevaSolicitudPage() {
  return (
    <Suspense fallback={null}>
      <NuevaSolicitudForm />
    </Suspense>
  );
}
