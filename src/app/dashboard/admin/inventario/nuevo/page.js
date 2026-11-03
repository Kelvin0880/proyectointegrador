'use client';
import { useRouter } from 'next/navigation';
import { Card, ErrorState, PageHeader, PageLoader, useToast } from '@/components/ui';
import { ItemForm } from '@/components/domain/ItemForm';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api-client';

export default function NuevoEquipoPage() {
  const router = useRouter();
  const toast = useToast();
  const departamentos = useApi('/api/departamentos');

  const create = async (values) => {
    const result = await api.post('/api/items', values);
    toast.success('Equipo registrado', `"${values.nombre}" ya está disponible en el inventario.`);
    router.push(`/dashboard/admin/inventario?q=${encodeURIComponent(values.nombre)}`);
    return result;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nuevo equipo" description="Registra un equipo para que los usuarios puedan solicitarlo." backHref="/dashboard/admin/inventario" backLabel="Inventario" />
      {departamentos.loading ? (
        <PageLoader />
      ) : departamentos.error ? (
        <Card>
          <ErrorState message={departamentos.error} onRetry={departamentos.refetch} />
        </Card>
      ) : (
        <ItemForm departamentos={departamentos.data} onSubmit={create} onCancel={() => router.push('/dashboard/admin/inventario')} />
      )}
    </div>
  );
}
