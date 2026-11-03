'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarDays, IdCard, KeyRound, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import {
  Alert, Avatar, Button, Card, CardBody, CardFooter, CardHeader, DescriptionList, ErrorState, Field, Input,
  PageHeader, PageLoader, PasswordInput, useToast,
} from '@/components/ui';
import { RolBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { validatePassword } from '@/lib/validation';

function DatosForm({ perfil, onSaved }) {
  const toast = useToast();
  const { update } = useSession();
  const [values, setValues] = useState({ nombre: perfil.nombre, apellido: perfil.apellido });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = values.nombre !== perfil.nombre || values.apellido !== perfil.apellido;

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio';
    if (!values.apellido.trim()) nextErrors.apellido = 'El apellido es obligatorio';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const result = await api.patch('/api/perfil', values);
      toast.success(result.message);
      onSaved(result.perfil);
      await update(); // refresca el nombre mostrado en la barra superior
    } catch (err) {
      if (err.details) setErrors(err.details);
      else toast.error('No se pudo guardar', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={submit} noValidate>
      <CardHeader icon={UserRound} title="Datos personales" description="Así aparecerás en tus solicitudes." />
      <CardBody className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" required error={errors.nombre}>
          {({ id, describedBy }) => (
            <Input id={id} aria-describedby={describedBy} autoComplete="given-name" value={values.nombre} maxLength={100} onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))} error={errors.nombre} />
          )}
        </Field>
        <Field label="Apellido" required error={errors.apellido}>
          {({ id, describedBy }) => (
            <Input id={id} aria-describedby={describedBy} autoComplete="family-name" value={values.apellido} maxLength={100} onChange={(e) => setValues((v) => ({ ...v, apellido: e.target.value }))} error={errors.apellido} />
          )}
        </Field>
      </CardBody>
      <CardFooter>
        <Button type="submit" icon={Save} loading={saving} disabled={!dirty}>
          Guardar cambios
        </Button>
      </CardFooter>
    </Card>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState({ actual: '', nueva: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.actual) nextErrors.actual = 'Ingresa tu contraseña actual';
    const passwordError = validatePassword(values.nueva);
    if (passwordError) nextErrors.nueva = passwordError;
    if (values.nueva !== values.confirmar) nextErrors.confirmar = 'Las contraseñas no coinciden';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const result = await api.patch('/api/perfil/password', { actual: values.actual, nueva: values.nueva });
      toast.success(result.message);
      setValues({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      if (err.details) setErrors(err.details);
      else toast.error('No se pudo cambiar la contraseña', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={submit} noValidate>
      <CardHeader icon={KeyRound} title="Cambiar contraseña" description="Usa al menos 6 caracteres." />
      <CardBody className="space-y-5">
        <Field label="Contraseña actual" required error={errors.actual}>
          {({ id, describedBy }) => <PasswordInput id={id} aria-describedby={describedBy} autoComplete="current-password" value={values.actual} onChange={set('actual')} error={errors.actual} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nueva contraseña" required error={errors.nueva}>
            {({ id, describedBy }) => <PasswordInput id={id} aria-describedby={describedBy} autoComplete="new-password" value={values.nueva} onChange={set('nueva')} error={errors.nueva} />}
          </Field>
          <Field label="Confirmar nueva contraseña" required error={errors.confirmar}>
            {({ id, describedBy }) => <PasswordInput id={id} aria-describedby={describedBy} autoComplete="new-password" value={values.confirmar} onChange={set('confirmar')} error={errors.confirmar} />}
          </Field>
        </div>
      </CardBody>
      <CardFooter>
        <Button type="submit" icon={KeyRound} loading={saving}>
          Actualizar contraseña
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PerfilPage() {
  const { data: perfil, error, loading, refetch, setData } = useApi('/api/perfil');
  const stats = useApi('/api/solicitudes/stats');

  if (loading) return <PageLoader label="Cargando perfil..." />;
  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={refetch} />
      </Card>
    );
  }

  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  return (
    <>
      <PageHeader title="Mi perfil" description="Administra tus datos personales y la seguridad de tu cuenta." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={nombreCompleto} size="lg" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{nombreCompleto}</h2>
            <p className="text-sm text-slate-500">{perfil.email}</p>
            <div className="mt-3">
              <RolBadge rol={perfil.rol} />
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-3 border-t border-slate-100 pt-6 text-center">
              <div>
                <p className="text-2xl font-bold tabular-nums text-slate-900">{stats.data?.total ?? '-'}</p>
                <p className="text-xs text-slate-500">Solicitudes</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-slate-900">{stats.data?.aprobadas ?? '-'}</p>
                <p className="text-xs text-slate-500">Préstamos activos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader icon={ShieldCheck} title="Información de la cuenta" />
            <CardBody>
              <DescriptionList
                items={[
                  { label: 'Matrícula', value: perfil.matricula, icon: IdCard },
                  { label: 'Correo institucional', value: perfil.email, icon: Mail },
                  { label: 'Rol', value: perfil.rol === 'admin' ? 'Administrador' : 'Usuario', icon: ShieldCheck },
                  { label: 'Miembro desde', value: formatDate(perfil.created_at), icon: CalendarDays },
                ]}
              />
              <Alert tone="info" className="mt-5">
                La matrícula y el correo no se pueden cambiar. Si hay un error, contacta a un administrador.
              </Alert>
            </CardBody>
          </Card>
          <DatosForm key={`${perfil.nombre}|${perfil.apellido}`} perfil={perfil} onSaved={setData} />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
