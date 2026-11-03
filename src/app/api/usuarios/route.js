import { query } from '@/lib/db';
import { handler, ok, requireAdmin } from '@/lib/server/http';
import { likePattern } from '@/lib/server/queries';

// Lista de usuarios con su actividad (solo administradores). Filtros: q, rol
export const GET = handler(async (req) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const where = [];
  const params = [];

  const rol = searchParams.get('rol');
  if (rol === 'admin' || rol === 'usuario') {
    where.push('u.rol = ?');
    params.push(rol);
  }
  const q = searchParams.get('q')?.trim();
  if (q) {
    const pattern = likePattern(q);
    where.push("(u.nombre LIKE ? ESCAPE '\\' OR u.apellido LIKE ? ESCAPE '\\' OR u.matricula LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\')");
    params.push(pattern, pattern, pattern, pattern);
  }

  const usuarios = await query(
    `SELECT u.id, u.matricula, u.email, u.nombre, u.apellido, u.rol, u.created_at,
            COUNT(s.id) AS total_solicitudes,
            SUM(CASE WHEN s.estado = 'Aprobada' THEN 1 ELSE 0 END) AS prestamos_activos
     FROM usuarios u
     LEFT JOIN solicitudes s ON s.usuario_id = u.id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     GROUP BY u.id
     ORDER BY u.rol ASC, u.nombre ASC, u.apellido ASC`,
    params
  );
  return ok(usuarios.map((u) => ({ ...u, prestamos_activos: u.prestamos_activos ?? 0 })));
});
