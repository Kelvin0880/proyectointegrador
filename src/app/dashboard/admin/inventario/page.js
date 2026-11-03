'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import {
  Button, Card, ConfirmDialog, DataTable, EmptyState, ErrorState, FilterTabs, PageHeader, ProgressBar,
  SearchInput, Select, Skeleton, useToast,
} from '@/components/ui';
import { ItemEstadoBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { useQueryParam } from '@/hooks/useQueryParam';
import { api, withQuery } from '@/lib/api-client';
import { ITEM_ESTADOS } from '@/lib/constants';

function Inventario() {
  const router = useRouter();
  const toast = useToast();
  const [departamento, setDepartamento] = useQueryParam('departamento');
  const [estado, setEstado] = useQueryParam('estado');
  const [q, setQ] = useQueryParam('q');
  const departamentos = useApi('/api/departamentos');
  const { data, error, loading, refetch } = useApi(withQuery('/api/items', { departamento_id: departamento, estado, q }));
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const totalItems = (departamentos.data ?? []).reduce((sum, d) => sum + d.total_items, 0);
  const tabs = [
    { value: '', label: 'Todos', count: departamentos.data ? totalItems : undefined },
    ...(departamentos.data ?? []).map((d) => ({ value: String(d.id), label: d.nombre, count: d.total_items })),
  ];

  const remove = async () => {
    setDeleting(true);
    try {
      const result = await api.delete(`/api/items/${toDelete.id}`);
      if (result.status === 'soft_delete') toast.info('Equipo marcado como agotado', result.message);
      else toast.success(result.message);
      setToDelete(null);
      refetch();
      departamentos.refetch();
    } catch (err) {
      toast.error('No se pudo eliminar', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Equipo',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-medium text-slate-900">{item.nombre}</p>
          <p className="truncate text-xs text-slate-500">{item.descripcion}</p>
        </div>
      ),
    },
    { key: 'departamento_nombre', header: 'Departamento', hideBelow: 'lg' },
    {
      key: 'disponibilidad',
      header: 'Disponibilidad',
      render: (item) => (
        <div className="w-36">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold tabular-nums text-slate-900">{item.cantidad_disponible}</span>
            <span className="tabular-nums text-slate-500">de {item.cantidad_total}</span>
          </div>
          <ProgressBar value={item.cantidad_disponible} max={item.cantidad_total} label={`Disponibilidad de ${item.nombre}`} />
        </div>
      ),
    },
    { key: 'estado', header: 'Estado', render: (item) => <ItemEstadoBadge estado={item.estado} /> },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (item) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" href={`/dashboard/admin/inventario/editar/${item.id}`} aria-label={`Editar ${item.nombre}`} title="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(item)} aria-label={`Eliminar ${item.nombre}`} title="Eliminar">
            <Trash2 className="size-4 text-red-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Equipos registrados por departamento y sus existencias."
        actions={
          <Button href="/dashboard/admin/inventario/nuevo" icon={PackagePlus}>
            Nuevo equipo
          </Button>
        }
      />

      <Card>
        <div className="space-y-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          {departamentos.loading ? <Skeleton className="h-8 w-72" /> : <FilterTabs options={tabs} value={departamento} onChange={setDepartamento} label="Departamento" />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar por nombre o descripción" className="sm:flex-1" label="Buscar equipos" />
            <div className="sm:w-56">
              <Select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
                <option value="">Todos los estados</option>
                {ITEM_ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable
            caption="Equipos del inventario"
            columns={columns}
            rows={data}
            loading={loading}
            onRowClick={(item) => router.push(`/dashboard/admin/inventario/editar/${item.id}`)}
            renderMobile={(item) => (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{item.nombre}</p>
                    <p className="text-xs text-slate-500">{item.departamento_nombre}</p>
                  </div>
                  <ItemEstadoBadge estado={item.estado} size="sm" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={item.cantidad_disponible} max={item.cantidad_total} label={`Disponibilidad de ${item.nombre}`} />
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {item.cantidad_disponible}/{item.cantidad_total}
                  </span>
                </div>
              </div>
            )}
            empty={
              <EmptyState
                icon={Boxes}
                title={q || estado || departamento ? 'Sin resultados' : 'Aún no hay equipos'}
                description={q || estado || departamento ? 'Ningún equipo coincide con los filtros aplicados.' : 'Registra el primer equipo del inventario.'}
                action={
                  <Button href="/dashboard/admin/inventario/nuevo" icon={PackagePlus}>
                    Nuevo equipo
                  </Button>
                }
              />
            }
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={deleting}
        title="Eliminar equipo"
        description={toDelete ? `¿Seguro que quieres eliminar "${toDelete.nombre}"?` : ''}
        confirmLabel="Eliminar"
      >
        <p className="text-sm text-slate-600">
          Si el equipo tiene solicitudes en su historial no se borrará: se marcará como agotado para conservar los registros.
        </p>
      </ConfirmDialog>
    </>
  );
}

export default function InventarioPage() {
  return (
    <Suspense fallback={null}>
      <Inventario />
    </Suspense>
  );
}
