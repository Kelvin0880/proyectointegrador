'use client';
import { useParams, useRouter } from 'next/navigation';
import { Card, ErrorState, PageHeader, PageLoader, StatCard, useToast } from '@/components/ui';
import { ItemEstadoBadge } from '@/components/domain/StatusBadges';
import { ItemForm } from '@/components/domain/ItemForm';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { Boxes, CircleCheck, PackageOpen } from 'lucide-react';

export default function EditarEquipoPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const item = useApi(`/api/items/${id}`);
  const departamentos = useApi('/api/departamentos');

  const save = async (values) => {
    const result = await api.patch(`/api/items/${id}`, values);
    toast.success('Cambios guardados', `"${result.item.nombre}" se actualizó correctamente.`);
    router.push('/dashboard/admin/inventario');
  };

  if (item.loading || departamentos.loading) return <PageLoader label="Cargando equipo..." />;

  if (item.error || departamentos.error) {
    return (
      <>
        <PageHeader title="Editar equipo" backHref="/dashboard/admin/inventario" backLabel="Inventario" />
        <Card>
          <ErrorState message={item.error || departamentos.error} onRetry={() => { item.refetch(); departamentos.refetch(); }} />
        </Card>
      </>
    );
  }

  const data = item.data;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={data.nombre}
        description={`Última actualización: ${formatDateTime(data.updated_at)}`}
        backHref="/dashboard/admin/inventario"
        backLabel="Inventario"
        actions={<ItemEstadoBadge estado={data.estado} />}
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total" value={data.cantidad_total} icon={Boxes} tone="slate" />
        <StatCard label="Disponibles" value={data.cantidad_disponible} icon={CircleCheck} tone="green" />
        <StatCard label="Prestadas" value={data.unidades_prestadas} icon={PackageOpen} tone="amber" />
      </div>

      <ItemForm
        mode="edit"
        initialValues={data}
        departamentos={departamentos.data}
        prestadas={data.unidades_prestadas}
        onSubmit={save}
        onCancel={() => router.push('/dashboard/admin/inventario')}
      />
    </div>
  );
}
