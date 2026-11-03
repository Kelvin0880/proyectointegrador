import { query } from '@/lib/db';
import { handler, ok, requireAdmin } from '@/lib/server/http';
import { PERIODOS_INFORME, SOLICITUD_ESTADOS, periodoLabel } from '@/lib/constants';

function fechaLimite(periodo, ahora = new Date()) {
  const fecha = new Date(ahora);
  switch (periodo) {
    case '5d': fecha.setDate(fecha.getDate() - 5); break;
    case '15d': fecha.setDate(fecha.getDate() - 15); break;
    case '1m': fecha.setMonth(fecha.getMonth() - 1); break;
    case '6m': fecha.setMonth(fecha.getMonth() - 6); break;
    case '1y': fecha.setFullYear(fecha.getFullYear() - 1); break;
    default: fecha.setHours(fecha.getHours() - 24);
  }
  return fecha;
}

const toSqlDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

// Informe de actividad por periodo (solo administradores)
export const GET = handler(async (req) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const periodo = PERIODOS_INFORME.some((p) => p.value === searchParams.get('periodo')) ? searchParams.get('periodo') : '24h';
  const tipo = ['equipos', 'usuarios', 'completo'].includes(searchParams.get('tipo')) ? searchParams.get('tipo') : 'completo';

  const ahora = new Date();
  const desde = toSqlDate(fechaLimite(periodo, ahora));
  const result = {};

  if (tipo === 'equipos' || tipo === 'completo') {
    result.equipos = await query(
      `SELECT i.id, i.nombre, d.nombre AS departamento_nombre, COUNT(s.id) AS total_solicitudes
       FROM solicitudes s
       INNER JOIN items i ON s.item_id = i.id
       INNER JOIN departamentos d ON i.departamento_id = d.id
       WHERE s.fecha_solicitud >= ?
       GROUP BY i.id
       ORDER BY total_solicitudes DESC, i.nombre ASC
       LIMIT 10`,
      [desde]
    );
  }

  if (tipo === 'usuarios' || tipo === 'completo') {
    result.usuarios = await query(
      `SELECT u.id, u.nombre, u.apellido, u.matricula, COUNT(s.id) AS total_solicitudes
       FROM solicitudes s
       INNER JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.fecha_solicitud >= ?
       GROUP BY u.id
       ORDER BY total_solicitudes DESC, u.nombre ASC
       LIMIT 10`,
      [desde]
    );
  }

  const estadoRows = await query(
    'SELECT estado, COUNT(*) AS total FROM solicitudes WHERE fecha_solicitud >= ? GROUP BY estado',
    [desde]
  );
  const porEstado = Object.fromEntries(SOLICITUD_ESTADOS.map((e) => [e, 0]));
  for (const row of estadoRows) porEstado[row.estado] = row.total;
  const total = estadoRows.reduce((sum, r) => sum + r.total, 0);

  result.resumen = { total, porEstado };
  result.meta = {
    periodo,
    periodoLabel: periodoLabel(periodo),
    tipo,
    fechaInicio: `${desde.replace(' ', 'T')}Z`,
    fechaFin: ahora.toISOString(),
  };
  if (total === 0) {
    result.mensaje = `No hay solicitudes registradas en el periodo seleccionado (${periodoLabel(periodo).toLowerCase()})`;
  }
  return ok(result);
});
