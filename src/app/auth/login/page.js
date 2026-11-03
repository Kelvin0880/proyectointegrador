'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { Alert, Button, Field, Input, PasswordInput } from '@/components/ui';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { INSTITUTION } from '@/lib/constants';
import { normalizeMatricula } from '@/lib/validation';

function safeCallback(url) {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : '/dashboard';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const callbackUrl = safeCallback(searchParams.get('callbackUrl'));

  const [matricula, setMatricula] = useState(searchParams.get('matricula') ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!normalizeMatricula(matricula)) nextErrors.matricula = 'Ingresa tu matrícula';
    if (!password) nextErrors.password = 'Ingresa tu contraseña';
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: normalizeMatricula(matricula),
        password,
        redirect: false,
      });
      if (result?.error) {
        setFormError('Matrícula o contraseña incorrecta. Verifica tus datos e intenta de nuevo.');
        setLoading(false);
        return;
      }
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setFormError('No se pudo iniciar sesión. Intenta de nuevo en unos minutos.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Accede con tu matrícula institucional para solicitar y dar seguimiento a tus préstamos."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Regístrate aquí
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {registered && (
          <Alert tone="success" title="Cuenta creada correctamente">
            Ya puedes iniciar sesión con tu matrícula y contraseña.
          </Alert>
        )}
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Matrícula" error={errors.matricula} hint="Por ejemplo: ab24-0001">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              name="matricula"
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              suffix={`@${INSTITUTION.emailDomain}`}
              error={errors.matricula}
            />
          )}
        </Field>

        <Field label="Contraseña" error={errors.password}>
          {({ id, describedBy }) => (
            <PasswordInput
              id={id}
              aria-describedby={describedBy}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          )}
        </Field>

        <Button type="submit" size="lg" fullWidth icon={LogIn} loading={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
