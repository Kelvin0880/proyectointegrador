import { query, queryOne } from '@/lib/db';
import { handler, ok, readJson, requireUser, badRequest } from '@/lib/server/http';
import { SOLICITUD_SELECT } from '@/lib/server/queries';
import { hasErrors, firstError, validateSolicitud, isValidSolicitudEstado } from '@/lib/validation';

// Solicitudes del usuario que inició sesión (filtro opcional: estado)
export const GET = handler(async (req) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const params = [user.id];
  let sql = `${SOLICITUD_SELECT} WHERE s.usuario_id = ?`;

  const estado = searchParams.get('estado');
  if (estado && isValidSolicitudEstado(estado)) {
    sql += ' AND s.estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY s.fecha_solicitud DESC, s.id DESC';
  return ok(await query(sql, params));
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await readJson(req);
  const errors = validateSolicitud(body);
  if (hasErrors(errors)) throw badRequest(firstError(errors), errors);

  const item = await queryOne('SELECT * FROM items WHERE id = ?', [Number(body.item_id)]);
  if (!item) throw badRequest('El equipo seleccionado no existe', { item_id: 'El equipo no existe' });
  if (item.estado === 'En mantenimiento') {
    throw badRequest('Este equipo está en mantenimiento', { item_id: 'Equipo en mantenimiento' });
  }
  if (item.cantidad_disponible <= 0) {
    throw badRequest('Este equipo no tiene unidades disponibles', { item_id: 'Sin unidades disponibles' });
  }

  const result = await query(
    `INSERT INTO solicitudes (usuario_id, item_id, fecha_uso, hora_inicio, hora_fin, motivo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.id, item.id, body.fecha_uso, body.hora_inicio.slice(0, 5), body.hora_fin.slice(0, 5), body.motivo.trim()]
  );
  return ok({ id: result.insertId, message: 'Solicitud enviada correctamente' }, 201);
});
