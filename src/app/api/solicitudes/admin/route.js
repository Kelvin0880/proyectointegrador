import { query } from '@/lib/db';
import { handler, ok, requireAdmin } from '@/lib/server/http';
import { SOLICITUD_SELECT, likePattern } from '@/lib/server/queries';
import { isValidSolicitudEstado } from '@/lib/validation';

// Todas las solicitudes (solo administradores). Filtros: estado, q (equipo, usuario o matrícula)
export const GET = handler(async (req) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const where = [];
  const params = [];

  const estado = searchParams.get('estado');
  if (estado && isValidSolicitudEstado(estado)) {
    where.push('s.estado = ?');
    params.push(estado);
  }
  const q = searchParams.get('q')?.trim();
  if (q) {
    const pattern = likePattern(q);
    where.push(`(i.nombre LIKE ? ESCAPE '\\' OR u.nombre LIKE ? ESCAPE '\\' OR u.apellido LIKE ? ESCAPE '\\'
      OR u.matricula LIKE ? ESCAPE '\\' OR s.motivo LIKE ? ESCAPE '\\')`);
    params.push(pattern, pattern, pattern, pattern, pattern);
  }

  const sql = `${SOLICITUD_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY CASE s.estado WHEN 'Pendiente' THEN 0 WHEN 'Aprobada' THEN 1 ELSE 2 END, s.fecha_solicitud DESC, s.id DESC`;
  return ok(await query(sql, params));
});
