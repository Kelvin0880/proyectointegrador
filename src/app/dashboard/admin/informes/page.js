'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, Boxes, CheckCheck, CircleCheck, CircleX, ClipboardList, Download, Hourglass, Users } from 'lucide-react';
import {
  Alert, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Field, PageHeader, Select, Skeleton, StatCard,
} from '@/components/ui';
import { RankingChart } from '@/components/informes/RankingChart';
import { useApi } from '@/hooks/useApi';
import { withQuery } from '@/lib/api-client';
import { PERIODOS_INFORME, TIPOS_INFORME } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';

// El generador de PDF solo funciona en el navegador
const PdfDownloadButton = dynamic(() => import('@/components/informes/PdfDownloadButton'), {
  ssr: false,
  loading: () => (
    <Button variant="secondary" icon={Download} disabled>
      Preparando PDF...
    </Button>
  ),
});

export default function InformesPage() {
  const [periodo, setPeriodo] = useState('1m');
  const [tipo, setTipo] = useState('completo');
  const { data, error, loading, refetch } = useApi(withQuery('/api/informes', { periodo, tipo }));
  const [ready, setReady] = useState(false);

  // Evita generar el PDF con datos de un filtro anterior
  useEffect(() => {
    setReady(false);
  }, [periodo, tipo]);
  useEffect(() => {
    if (data && !loading) setReady(true);
  }, [data, loading]);

  const showEquipos = tipo !== 'usuarios';
  const showUsuarios = tipo !== 'equipos';
  const r = data?.resumen;

  return (
    <>
      <PageHeader
        title="Informes"
        description="Analiza la actividad de préstamos y descarga el informe en PDF."
        actions={data && ready ? <PdfDownloadButton data={data} /> : null}
      />

      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Periodo">
              {({ id }) => (
                <Select id={id} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  {PERIODOS_INFORME.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Tipo de informe">
              {({ id }) => (
                <Select id={id} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {TIPOS_INFORME.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.description.toLowerCase()})
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {data?.meta && (
              <div className="flex items-end text-sm text-slate-500 sm:col-span-2 lg:col-span-1">
                <p>
                  Desde <span className="font-medium text-slate-700">{formatDateTime(data.meta.fechaInicio)}</span>
                  <br />
                  hasta <span className="font-medium text-slate-700">{formatDateTime(data.meta.fechaFin)}</span>
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {error ? (
        <Card>
          <ErrorState message={error} onRetry={refetch} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Total" value={r?.total ?? 0} icon={ClipboardList} tone="slate" loading={loading} />
            <StatCard label="Pendientes" value={r?.porEstado.Pendiente ?? 0} icon={Hourglass} tone="amber" loading={loading} />
            <StatCard label="Aprobadas" value={r?.porEstado.Aprobada ?? 0} icon={CircleCheck} tone="green" loading={loading} />
            <StatCard label="Finalizadas" value={r?.porEstado.Finalizada ?? 0} icon={CheckCheck} tone="blue" loading={loading} />
            <StatCard label="Rechazadas" value={r?.porEstado.Rechazada ?? 0} icon={CircleX} tone="red" loading={loading} />
          </div>

          {data?.mensaje && !loading && (
            <Alert tone="info" className="mt-6">
              {data.mensaje}. Prueba con un periodo más amplio.
            </Alert>
          )}

          <div className={`mt-6 grid gap-6 ${showEquipos && showUsuarios ? 'xl:grid-cols-2' : ''}`}>
            {showEquipos && (
              <Card>
                <CardHeader icon={Boxes} title="Equipos más solicitados" description="Top 10 por número de solicitudes" />
                <CardBody>
                  {loading ? (
                    <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
                  ) : data?.equipos?.length ? (
                    <RankingChart
                      rows={data.equipos.map((e) => ({ id: e.id, label: e.nombre, sublabel: e.departamento_nombre, value: e.total_solicitudes }))}
                      labelHeader="Equipo"
                      sublabelHeader="Departamento"
                    />
                  ) : (
                    <EmptyState icon={BarChart3} title="Sin datos" description="No hubo solicitudes de equipos en este periodo." compact />
                  )}
                </CardBody>
              </Card>
            )}
            {showUsuarios && (
              <Card>
                <CardHeader icon={Users} title="Usuarios más activos" description="Top 10 por número de solicitudes" />
                <CardBody>
                  {loading ? (
                    <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
                  ) : data?.usuarios?.length ? (
                    <RankingChart
                      rows={data.usuarios.map((u) => ({ id: u.id, label: `${u.nombre} ${u.apellido}`, sublabel: u.matricula, value: u.total_solicitudes }))}
                      labelHeader="Usuario"
                      sublabelHeader="Matrícula"
                    />
                  ) : (
                    <EmptyState icon={Users} title="Sin datos" description="Ningún usuario hizo solicitudes en este periodo." compact />
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
