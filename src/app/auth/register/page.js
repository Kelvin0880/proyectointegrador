'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Alert, Button, Field, Input, PasswordInput } from '@/components/ui';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { api } from '@/lib/api-client';
import { INSTITUTION } from '@/lib/constants';
import { firstError, hasErrors, normalizeMatricula, validateRegistro } from '@/lib/validation';

const INITIAL = { matricula: '', nombre: '', apellido: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const validation = validateRegistro(values, { checkConfirm: true });
    if (hasErrors(validation)) {
      setErrors(validation);
      setFormError(firstError(validation));
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', values);
      const matricula = normalizeMatricula(values.matricula);
      router.push(`/auth/login?registered=true&matricula=${encodeURIComponent(matricula)}`);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      description="Regístrate con tu matrícula de la UNPHU para solicitar equipos."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Matrícula" required error={errors.matricula} hint={`Tu correo será matricula@${INSTITUTION.emailDomain}`}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              name="matricula"
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
              value={values.matricula}
              onChange={set('matricula')}
              suffix={`@${INSTITUTION.emailDomain}`}
              error={errors.matricula}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" required error={errors.nombre}>
            {({ id, describedBy }) => (
              <Input id={id} aria-describedby={describedBy} name="nombre" autoComplete="given-name" value={values.nombre} onChange={set('nombre')} maxLength={100} error={errors.nombre} />
            )}
          </Field>
          <Field label="Apellido" required error={errors.apellido}>
            {({ id, describedBy }) => (
              <Input id={id} aria-describedby={describedBy} name="apellido" autoComplete="family-name" value={values.apellido} onChange={set('apellido')} maxLength={100} error={errors.apellido} />
            )}
          </Field>
        </div>

        <Field label="Contraseña" required error={errors.password} hint="Mínimo 6 caracteres">
          {({ id, describedBy }) => (
            <PasswordInput id={id} aria-describedby={describedBy} name="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} />
          )}
        </Field>

        <Field label="Confirmar contraseña" required error={errors.confirmPassword}>
          {({ id, describedBy }) => (
            <PasswordInput id={id} aria-describedby={describedBy} name="confirmPassword" autoComplete="new-password" value={values.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
          )}
        </Field>

        <Button type="submit" size="lg" fullWidth icon={UserPlus} loading={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
