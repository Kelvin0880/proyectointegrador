import { query, queryOne } from '@/lib/db';
import { handler, ok, requireAdmin } from '@/lib/server/http';
import { SOLICITUD_SELECT } from '@/lib/server/queries';
import { SOLICITUD_ESTADOS } from '@/lib/constants';

// Resumen general para el panel del administrador
export const GET = handler(async () => {
  await requireAdmin();

  const estadoRows = await query('SELECT estado, COUNT(*) AS total FROM solicitudes GROUP BY estado');
  const solicitudes = Object.fromEntries(SOLICITUD_ESTADOS.map((e) => [e, 0]));
  for (const row of estadoRows) solicitudes[row.estado] = row.total;

  const inventario = await queryOne(`
    SELECT COUNT(*) AS equipos,
           COALESCE(SUM(cantidad_total), 0) AS unidades_totales,
           COALESCE(SUM(cantidad_disponible), 0) AS unidades_disponibles,
           SUM(CASE WHEN estado = 'Agotado' OR cantidad_disponible = 0 THEN 1 ELSE 0 END) AS agotados,
           SUM(CASE WHEN estado = 'En mantenimiento' THEN 1 ELSE 0 END) AS en_mantenimiento
    FROM items
  `);

  const usuarios = await queryOne(`
    SELECT COUNT(*) AS total, SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) AS administradores FROM usuarios
  `);

  const departamentos = await query(`
    SELECT d.id, d.nombre,
           COUNT(i.id) AS equipos,
           COALESCE(SUM(i.cantidad_total), 0) AS unidades_totales,
           COALESCE(SUM(i.cantidad_disponible), 0) AS unidades_disponibles
    FROM departamentos d
    LEFT JOIN items i ON i.departamento_id = d.id
    GROUP BY d.id
    ORDER BY d.nombre
  `);

  const pendientesRecientes = await query(
    `${SOLICITUD_SELECT} WHERE s.estado = 'Pendiente' ORDER BY s.fecha_solicitud ASC, s.id ASC LIMIT 5`
  );

  const stockBajo = await query(`
    SELECT i.id, i.nombre, i.cantidad_total, i.cantidad_disponible, i.estado, d.nombre AS departamento_nombre
    FROM items i INNER JOIN departamentos d ON d.id = i.departamento_id
    WHERE i.estado != 'En mantenimiento' AND i.cantidad_disponible <= MAX(1, i.cantidad_total * 0.2)
    ORDER BY CAST(i.cantidad_disponible AS REAL) / MAX(i.cantidad_total, 1) ASC
    LIMIT 5
  `);

  return ok({
    solicitudes: { ...solicitudes, total: estadoRows.reduce((s, r) => s + r.total, 0) },
    inventario,
    usuarios,
    departamentos,
    pendientesRecientes,
    stockBajo,
  });
});
