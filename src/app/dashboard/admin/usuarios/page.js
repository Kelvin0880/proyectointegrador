'use client';
import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, ShieldMinus, Users } from 'lucide-react';
import {
  Avatar, Button, Card, ConfirmDialog, DataTable, EmptyState, ErrorState, FilterTabs, PageHeader, SearchInput, useToast,
} from '@/components/ui';
import { RolBadge } from '@/components/domain/StatusBadges';
import { useApi } from '@/hooks/useApi';
import { useQueryParam } from '@/hooks/useQueryParam';
import { api, withQuery } from '@/lib/api-client';
import { formatShortDate } from '@/lib/format';

const ROLE_TABS = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Administradores' },
  { value: 'usuario', label: 'Usuarios' },
];

function Usuarios() {
  const toast = useToast();
  const { data: session } = useSession();
  const [rol, setRol] = useQueryParam('rol');
  const [q, setQ] = useQueryParam('q');
  const { data, error, loading, refetch } = useApi(withQuery('/api/usuarios', { rol, q }));
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const isSelf = (u) => String(u.id) === String(session?.user?.id);
  const nextRol = target?.rol === 'admin' ? 'usuario' : 'admin';

  const changeRole = async () => {
    setSaving(true);
    try {
      const result = await api.patch(`/api/usuarios/${target.id}`, { rol: nextRol });
      toast.success(result.message);
      setTarget(null);
      refetch();
    } catch (err) {
      toast.error('No se pudo cambiar el rol', err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleAction = (user) =>
    isSelf(user) ? (
      <span className="text-xs text-slate-400">Tu cuenta</span>
    ) : user.rol === 'admin' ? (
      <Button size="sm" variant="secondary" icon={ShieldMinus} onClick={() => setTarget(user)}>
        Quitar admin
      </Button>
    ) : (
      <Button size="sm" variant="soft" icon={ShieldCheck} onClick={() => setTarget(user)}>
        Hacer admin
      </Button>
    );

  const columns = [
    {
      key: 'nombre',
      header: 'Usuario',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${u.nombre} ${u.apellido}`} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">
              {u.nombre} {u.apellido}
            </p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'matricula', header: 'Matrícula', render: (u) => <span className="font-mono text-xs">{u.matricula}</span>, hideBelow: 'lg' },
    { key: 'rol', header: 'Rol', render: (u) => <RolBadge rol={u.rol} /> },
    { key: 'total_solicitudes', header: 'Solicitudes', align: 'center', render: (u) => <span className="tabular-nums">{u.total_solicitudes}</span> },
    { key: 'prestamos_activos', header: 'Préstamos activos', align: 'center', render: (u) => <span className="tabular-nums">{u.prestamos_activos}</span>, hideBelow: 'xl' },
    { key: 'created_at', header: 'Registro', render: (u) => <span className="whitespace-nowrap text-slate-500">{formatShortDate(u.created_at)}</span>, hideBelow: 'xl' },
    { key: 'acciones', header: <span className="sr-only">Acciones</span>, align: 'right', render: (u) => roleAction(u) },
  ];

  return (
    <>
      <PageHeader title="Usuarios" description="Personas registradas en el sistema y sus permisos." />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs options={ROLE_TABS} value={rol} onChange={setRol} label="Filtrar por rol" />
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por nombre, matrícula o correo" className="lg:w-80" label="Buscar usuarios" />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable
            caption="Usuarios registrados"
            columns={columns}
            rows={data}
            loading={loading}
            renderMobile={(u) => (
              <div className="flex items-center gap-3">
                <Avatar name={`${u.nombre} ${u.apellido}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {u.nombre} {u.apellido}
                  </p>
                  <p className="text-xs text-slate-500">
                    {u.matricula} · {u.total_solicitudes} solicitudes
                  </p>
                  <div className="mt-1.5">
                    <RolBadge rol={u.rol} />
                  </div>
                </div>
                {roleAction(u)}
              </div>
            )}
            empty={<EmptyState icon={Users} title="Sin resultados" description="Ningún usuario coincide con la búsqueda." />}
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={changeRole}
        loading={saving}
        tone={nextRol === 'admin' ? 'primary' : 'danger'}
        title={nextRol === 'admin' ? 'Dar permisos de administrador' : 'Quitar permisos de administrador'}
        description={
          target
            ? nextRol === 'admin'
              ? `${target.nombre} ${target.apellido} podrá aprobar solicitudes, gestionar el inventario y ver informes.`
              : `${target.nombre} ${target.apellido} dejará de tener acceso a las secciones de administración.`
            : ''
        }
        confirmLabel={nextRol === 'admin' ? 'Hacer administrador' : 'Quitar permisos'}
      />
    </>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={null}>
      <Usuarios />
    </Suspense>
  );
}
